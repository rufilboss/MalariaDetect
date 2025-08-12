# Team Information Update Guide

## 🎯 How to Update Team Information

The About page currently uses placeholder information for your 7-person team. Here's how to easily update it with your real team details:

### 📍 File Location
```
frontend/src/pages/About.js
```

### 🔧 What to Update

#### 1. Team Member Information
Find the `teamMembers` array (around line 15) and update each member:

```javascript
const teamMembers = [
  {
    id: 1,
    name: "Your Real Name",           // ← Update this
    role: "Your Actual Role",         // ← Update this
    image: "your-photo-url.jpg",      // ← Update this
    description: "Your bio...",       // ← Update this
    skills: ["Your", "Skills", "Here"] // ← Update this
  },
  // ... repeat for all 7 team members
];
```

#### 2. Contact Information
Find the contact section (around line 280) and update:

```javascript
// Email
<p className="text-gray-600">your-real-email@domain.com</p>

// Phone  
<p className="text-gray-600">+1 (555) 123-4567</p>

// Location
<p className="text-gray-600">Your University/Organization</p>
```

### 📸 Adding Team Photos

#### Option 1: Use Unsplash (Current)
The current setup uses Unsplash placeholder images. You can:
- Keep using Unsplash by finding professional photos
- Replace URLs with your team's photos

#### Option 2: Add Local Photos
1. Add photos to `frontend/public/team/` folder
2. Update image URLs to: `"/team/your-photo.jpg"`

#### Option 3: Use External URLs
- Upload photos to services like Imgur, Google Drive, etc.
- Use the direct image URLs

### 🎨 Team Roles to Consider

Based on your project, here are suggested roles:

1. **Project Lead** - Overall coordination
2. **Machine Learning Engineer** - AI model development
3. **Frontend Developer** - User interface
4. **Backend Developer** - API and server
5. **Data Scientist** - Data analysis and optimization
6. **DevOps Engineer** - Deployment and infrastructure
7. **UI/UX Designer** - User experience design

### 🚀 Quick Update Steps

1. **Open** `frontend/src/pages/About.js`
2. **Find** the `teamMembers` array
3. **Replace** placeholder names with real names
4. **Update** roles to match actual responsibilities
5. **Add** real photos (or keep Unsplash for now)
6. **Write** brief descriptions for each member
7. **List** actual skills for each person
8. **Update** contact information at the bottom

### 💡 Tips

- **Keep descriptions brief** (1-2 sentences)
- **Use professional photos** if possible
- **List relevant skills** for your project
- **Make roles specific** to what each person actually did
- **Test the page** after updates to ensure it looks good

### 🔄 After Updates

1. Save the file
2. The frontend will automatically reload
3. Visit `http://localhost:3000/about` to see changes
4. Make sure all photos load correctly
5. Check that the layout looks good on different screen sizes

---

## 📞 Need Help?

If you need help updating the team information or have questions about the code, just ask! The structure is designed to be easy to modify. 