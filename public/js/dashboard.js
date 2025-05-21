const token = new URLSearchParams(location.search).get("token");

// Load profile
fetch("/api/profile", {
  headers: { Authorization: `Bearer ${token}` },
})
  .then((res) => res.json())
  .then((data) => {
    document.getElementById(
      "profileImage"
    ).src = `/uploads/${data.profileImage}`;
    document.getElementById("userEmail").textContent = data.email;
  });

// Load blogs
function fetchBlogs() {
  fetch("/blogs", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((blogs) => {
      const rows = blogs
        .map(
          (blog) => `
      <tr>
        <td>${blog.title}</td>
        <td><img src="/uploads/blogs/${blog.image}" width="60" /></td>
        <td>${blog.description.substring(0, 50)}...</td>
        <td>
          <button onclick="viewBlog('${
            blog.title
          }', '${blog.description.replace(/'/g, "\\'")}', '${
            blog.image
          }')">View</button>
          <button onclick="openEdit('${blog._id}', '${
            blog.title
          }', '${blog.description.replace(/'/g, "\\'")}', '${
            blog.image
          }')">Edit</button>
          <button onclick="deleteBlog('${blog._id}')">Delete</button>
        </td>
      </tr>
    `
        )
        .join("");
      document.getElementById("blogTableBody").innerHTML = rows;
    });
}

fetchBlogs();

// Modal Functions
function openModal(id) {
  document.getElementById(id).style.display = "block";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

document.getElementById("addBlogBtn").onclick = () => {
  document.getElementById("blogForm").reset();
  document.getElementById("blogId").value = "";
  document.getElementById("modalTitle").textContent = "Add Blog";
  openModal("blogModal");
};

function viewBlog(title, description, image) {
  document.getElementById("viewTitle").textContent = title;
  document.getElementById("viewDescription").textContent = description;
  document.getElementById("viewImage").src = `/uploads/blogs/${image}`;
  openModal("viewModal");
}

function openEdit(id, title, description) {
  document.getElementById("blogId").value = id;
  document.getElementById("title").value = title;
  document.getElementById("description").value = description;
  document.getElementById("modalTitle").textContent = "Edit Blog";
  openModal("blogModal");
}

document.getElementById("blogForm").onsubmit = function (e) {
  e.preventDefault();
  const id = document.getElementById("blogId").value;
  const formData = new FormData();
  formData.append("title", document.getElementById("title").value);
  formData.append("description", document.getElementById("description").value);
  const file = document.getElementById("image").files[0];
  if (file) formData.append("image", file);

  const method = id ? "PUT" : "POST";
  const url = id ? `/blogs/${id}` : "/blogs";

  fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
    .then((res) => res.json())
    .then(() => {
      closeModal("blogModal");
      fetchBlogs();
    });
};

function deleteBlog(id) {
  if (!confirm("Are you sure you want to delete this blog?")) return;
  fetch(`/blogs/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then(() => fetchBlogs());
}

window.onclick = function (event) {
  ["blogModal", "viewModal"].forEach((id) => {
    if (event.target === document.getElementById(id)) {
      closeModal(id);
    }
  });
};
