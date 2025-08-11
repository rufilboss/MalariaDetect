import sqlite3
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import os

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.db_path = "malaria_classifier.db"
        self.connection = None
        
    async def initialize(self):
        """Initialize database and create tables"""
        try:
            self.connection = sqlite3.connect(self.db_path, check_same_thread=False)
            self.connection.row_factory = sqlite3.Row
            
            # Create tables
            await self._create_tables()
            logger.info("Database initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing database: {str(e)}")
            raise e
    
    async def _create_tables(self):
        """Create database tables"""
        cursor = self.connection.cursor()
        
        # Classification results table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS classification_results (
                result_id TEXT PRIMARY KEY,
                user_id TEXT,
                filename TEXT NOT NULL,
                prediction TEXT NOT NULL,
                confidence REAL NOT NULL,
                processing_time REAL NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                image_metadata TEXT
            )
        ''')
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME
            )
        ''')
        
        # Model versions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS model_versions (
                version_id TEXT PRIMARY KEY,
                model_path TEXT NOT NULL,
                accuracy REAL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT FALSE
            )
        ''')
        
        # API statistics table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS api_statistics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                total_classifications INTEGER DEFAULT 0,
                total_users INTEGER DEFAULT 0,
                average_confidence REAL DEFAULT 0.0,
                average_processing_time REAL DEFAULT 0.0,
                parasitized_count INTEGER DEFAULT 0,
                uninfected_count INTEGER DEFAULT 0,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        self.connection.commit()
        logger.info("Database tables created successfully")
    
    async def save_classification_result(
        self,
        result_id: str,
        user_id: Optional[str],
        filename: str,
        prediction: str,
        confidence: float,
        processing_time: float,
        image_metadata: Optional[Dict] = None
    ):
        """Save classification result to database"""
        try:
            cursor = self.connection.cursor()
            
            metadata_json = json.dumps(image_metadata) if image_metadata else None
            
            cursor.execute('''
                INSERT INTO classification_results 
                (result_id, user_id, filename, prediction, confidence, processing_time, image_metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (result_id, user_id, filename, prediction, confidence, processing_time, metadata_json))
            
            self.connection.commit()
            logger.info(f"Classification result saved: {result_id}")
            
        except Exception as e:
            logger.error(f"Error saving classification result: {str(e)}")
            raise e
    
    async def get_classification_result(self, result_id: str) -> Optional[Dict[str, Any]]:
        """Get classification result by ID"""
        try:
            cursor = self.connection.cursor()
            
            cursor.execute('''
                SELECT * FROM classification_results WHERE result_id = ?
            ''', (result_id,))
            
            row = cursor.fetchone()
            if row:
                result = dict(row)
                if result.get('image_metadata'):
                    result['image_metadata'] = json.loads(result['image_metadata'])
                return result
            
            return None
            
        except Exception as e:
            logger.error(f"Error retrieving classification result: {str(e)}")
            raise e
    
    async def get_user_results(self, user_id: str, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """Get classification results for a specific user"""
        try:
            cursor = self.connection.cursor()
            
            cursor.execute('''
                SELECT * FROM classification_results 
                WHERE user_id = ? 
                ORDER BY timestamp DESC 
                LIMIT ? OFFSET ?
            ''', (user_id, limit, offset))
            
            rows = cursor.fetchall()
            results = []
            
            for row in rows:
                result = dict(row)
                if result.get('image_metadata'):
                    result['image_metadata'] = json.loads(result['image_metadata'])
                results.append(result)
            
            return results
            
        except Exception as e:
            logger.error(f"Error retrieving user results: {str(e)}")
            raise e
    
    async def get_statistics(self) -> Dict[str, Any]:
        """Get API usage statistics"""
        try:
            cursor = self.connection.cursor()
            
            # Get basic counts
            cursor.execute('SELECT COUNT(*) as total FROM classification_results')
            total_classifications = cursor.fetchone()['total']
            
            cursor.execute('SELECT COUNT(DISTINCT user_id) as total FROM classification_results WHERE user_id IS NOT NULL')
            total_users = cursor.fetchone()['total']
            
            # Get average confidence and processing time
            cursor.execute('''
                SELECT AVG(confidence) as avg_confidence, AVG(processing_time) as avg_time 
                FROM classification_results
            ''')
            avg_row = cursor.fetchone()
            average_confidence = avg_row['avg_confidence'] or 0.0
            average_processing_time = avg_row['avg_time'] or 0.0
            
            # Get prediction counts
            cursor.execute('''
                SELECT prediction, COUNT(*) as count 
                FROM classification_results 
                GROUP BY prediction
            ''')
            prediction_counts = dict(cursor.fetchall())
            
            parasitized_count = prediction_counts.get('Parasitized', 0)
            uninfected_count = prediction_counts.get('Uninfected', 0)
            
            # Get today's classifications
            today = datetime.now().date()
            cursor.execute('''
                SELECT COUNT(*) as count 
                FROM classification_results 
                WHERE DATE(timestamp) = ?
            ''', (today,))
            today_classifications = cursor.fetchone()['count']
            
            return {
                "total_classifications": total_classifications,
                "total_users": total_users,
                "average_confidence": round(average_confidence, 3),
                "average_processing_time": round(average_processing_time, 3),
                "parasitized_count": parasitized_count,
                "uninfected_count": uninfected_count,
                "today_classifications": today_classifications
            }
            
        except Exception as e:
            logger.error(f"Error retrieving statistics: {str(e)}")
            raise e
    
    async def create_user(self, user_id: str, username: str, email: str, password_hash: str) -> bool:
        """Create a new user"""
        try:
            cursor = self.connection.cursor()
            
            cursor.execute('''
                INSERT INTO users (user_id, username, email, password_hash)
                VALUES (?, ?, ?, ?)
            ''', (user_id, username, email, password_hash))
            
            self.connection.commit()
            logger.info(f"User created: {username}")
            return True
            
        except sqlite3.IntegrityError:
            logger.warning(f"User already exists: {username}")
            return False
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            raise e
    
    async def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """Get user by username"""
        try:
            cursor = self.connection.cursor()
            
            cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
            row = cursor.fetchone()
            
            return dict(row) if row else None
            
        except Exception as e:
            logger.error(f"Error retrieving user: {str(e)}")
            raise e
    
    async def update_user_login(self, user_id: str):
        """Update user's last login time"""
        try:
            cursor = self.connection.cursor()
            
            cursor.execute('''
                UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?
            ''', (user_id,))
            
            self.connection.commit()
            
        except Exception as e:
            logger.error(f"Error updating user login: {str(e)}")
            raise e
    
    async def save_model_version(self, version_id: str, model_path: str, accuracy: Optional[float] = None):
        """Save model version information"""
        try:
            cursor = self.connection.cursor()
            
            cursor.execute('''
                INSERT INTO model_versions (version_id, model_path, accuracy)
                VALUES (?, ?, ?)
            ''', (version_id, model_path, accuracy))
            
            self.connection.commit()
            logger.info(f"Model version saved: {version_id}")
            
        except Exception as e:
            logger.error(f"Error saving model version: {str(e)}")
            raise e
    
    async def get_latest_model_version(self) -> Optional[Dict[str, Any]]:
        """Get the latest model version"""
        try:
            cursor = self.connection.cursor()
            
            cursor.execute('''
                SELECT * FROM model_versions 
                ORDER BY created_at DESC 
                LIMIT 1
            ''')
            
            row = cursor.fetchone()
            return dict(row) if row else None
            
        except Exception as e:
            logger.error(f"Error retrieving model version: {str(e)}")
            raise e
    
    async def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            logger.info("Database connection closed") 