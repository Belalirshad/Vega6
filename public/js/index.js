function validateForm() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const image = document.getElementById("profileImage").files[0];
  const errorMessage = document.getElementById("error-message");

  errorMessage.textContent = "";

  const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
  if (!emailPattern.test(email)) {
    errorMessage.textContent = "Please enter a valid email address.";
    return false;
  }

  if (password.length < 8) {
    errorMessage.textContent = "Password must be at least 8 characters.";
    return false;
  }

  if (!image || !image.type.startsWith("image/")) {
    errorMessage.textContent = "Please upload a valid image file.";
    return false;
  }

  if (image.size > 2 * 1024 * 1024) {
    errorMessage.textContent = "Image must be smaller than 2mb.";
    return false;
  }

  return true;
}
