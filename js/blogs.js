// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyA9ITnwlsXb-lPF0uHzpLLkZigZXiOyLas",
    authDomain: "summage-data.firebaseapp.com",
    projectId: "summage-data",
    storageBucket: "summage-data.appspot.com",
    messagingSenderId: "455020261289",
    appId: "1:455020261289:web:e0daa8bc88566c99219eb8"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  
  // DOM Elements
  const readerMode = document.getElementById("readerMode");
  const blogsContainer = document.getElementById("blogsContainer");
  const searchInput = document.getElementById("searchInput");
  const writerCodeInput = document.getElementById("writerCodeInput");
  const writerCodeBtn = document.getElementById("writerCodeBtn");
  
  const writerMode = document.getElementById("writerMode");
  const blogList = document.getElementById("blogList");
  const newBlogBtn = document.getElementById("newBlogBtn");
  const editorSection = document.getElementById("editorSection");
  const blogTitleInput = document.getElementById("blogTitle");
  const blogContentInput = document.getElementById("blogContent");
  const blogTagsInput = document.getElementById("blogTags");
  const blogStatusInput = document.getElementById("blogStatus");
  const saveBlogBtn = document.getElementById("saveBlogBtn");
  const cancelEditBtn = document.getElementById("cancelEditBtn");
  
  let editingBlogId = null;
  const WORKER_CODE = "summage123";
  
  // --- Reader Mode ---
  function loadNewestBlogs() {
    blogsContainer.innerHTML = "";
    db.collection("blogs")
      .orderBy("date", "desc")
      .limit(20)
      .get()
      .then(snapshot => {
        let count = 0;
        snapshot.forEach(doc => {
          const blog = doc.data();
          if (blog.status === "published" && count < 5) {
            blogsContainer.innerHTML += `
              <div class="blog-card">
                <h3>${blog.title}</h3>
                <p>${blog.content.substring(0, 180)}...</p>
                <small>${new Date(blog.date.toDate()).toLocaleDateString()}</small>
              </div>`;
            count++;
          }
        });
        if (count === 0) blogsContainer.innerHTML = "<p>No blogs yet. Stay tuned!</p>";
      });
  }
  
  // --- Search ---
  searchInput.addEventListener("input", e => {
    const term = e.target.value.toLowerCase().trim();
    if (term === "") return loadNewestBlogs();
  
    db.collection("blogs").get().then(snapshot => {
      blogsContainer.innerHTML = "";
      snapshot.forEach(doc => {
        const blog = doc.data();
        if (
          blog.status === "published" &&
          (blog.title.toLowerCase().includes(term) ||
            blog.tags?.some(tag => tag.toLowerCase().includes(term)))
        ) {
          blogsContainer.innerHTML += `
            <div class="blog-card">
              <h3>${blog.title}</h3>
              <p>${blog.content.substring(0, 180)}...</p>
              <small>${new Date(blog.date.toDate()).toLocaleDateString()}</small>
            </div>`;
        }
      });
    });
  });
  
  // --- Writer Mode ---
  writerCodeBtn.addEventListener("click", () => {
    if (writerCodeInput.value === WORKER_CODE) {
      readerMode.classList.add("hidden");
      writerMode.classList.remove("hidden");
      loadWorkspace();
    } else alert("Wrong code!");
  });
  
  // --- Workspace ---
  function loadWorkspace() {
    db.collection("blogs")
      .orderBy("date", "desc")
      .get()
      .then(snapshot => {
        blogList.innerHTML = "";
        snapshot.forEach(doc => {
          const blog = doc.data();
          const id = doc.id;
          const statusColor = blog.status === "published" ? "#007a52" : "#999";
          blogList.innerHTML += `
            <div class="blog-item">
              <span style="color:${statusColor}">${blog.title} (${blog.status})</span>
              <div>
                <button onclick="editBlog('${id}')">Edit</button>
                <button onclick="deleteBlog('${id}')">Delete</button>
              </div>
            </div>`;
        });
      });
  }
  
  // --- New Blog ---
  newBlogBtn.addEventListener("click", () => {
    editingBlogId = null;
    blogTitleInput.value = "";
    blogContentInput.value = "";
    blogTagsInput.value = "";
    blogStatusInput.value = "draft";
    editorSection.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  
  // --- Edit Blog ---
  window.editBlog = function (id) {
    db.collection("blogs")
      .doc(id)
      .get()
      .then(doc => {
        const blog = doc.data();
        editingBlogId = id;
        blogTitleInput.value = blog.title;
        blogContentInput.value = blog.content;
        blogTagsInput.value = blog.tags.join(",");
        blogStatusInput.value = blog.status;
        editorSection.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
  };
  
  // --- Delete Blog ---
  window.deleteBlog = function (id) {
    if (confirm("Delete this blog?")) {
      db.collection("blogs")
        .doc(id)
        .delete()
        .then(() => loadWorkspace());
    }
  };
  
  // --- Save Blog ---
  saveBlogBtn.addEventListener("click", async () => {
    const title = blogTitleInput.value.trim();
    const content = blogContentInput.value.trim();
    const tags = blogTagsInput.value.split(",").map(t => t.trim()).filter(Boolean);
    const status = blogStatusInput.value;
  
    if (!title || !content) {
      alert("Title and content required!");
      return;
    }
  
    try {
      if (editingBlogId) {
        const updateData = { title, content, tags, status };
        await db.collection("blogs").doc(editingBlogId).update(updateData);
      } else {
        await db.collection("blogs").add({
          title,
          content,
          tags,
          status,
          date: firebase.firestore.FieldValue.serverTimestamp(),
          author: "Writer"
        });
      }
  
      alert("Blog saved!");
      editorSection.classList.add("hidden");
      loadWorkspace();
    } catch (err) {
      console.error("Error saving blog:", err);
      alert("Error saving blog. See console for details.");
    }
  });
  
  // --- Cancel Edit ---
  cancelEditBtn.addEventListener("click", () =>
    editorSection.classList.add("hidden")
  );
  
  // --- On Load ---
  window.addEventListener("DOMContentLoaded", () => loadNewestBlogs());
  