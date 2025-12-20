const params = new URLSearchParams(window.location.search);
const token = params.get("token");

if (token) {
  connect(token);
} else {
  console.log("No token found");
}
