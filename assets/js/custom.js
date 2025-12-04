// =======================
// REAL-TIME VALIDATION
// =======================
const fields = {
  name: document.getElementById("name"),
  surname: document.getElementById("surname"),
  email: document.getElementById("email"),
  phone: document.getElementById("phone"),
  address: document.getElementById("address"),
  rating1: document.getElementById("rating1"),
  rating2: document.getElementById("rating2"),
  rating3: document.getElementById("rating3")
};

const submitBtn = document.getElementById("submitBtn");

function validateName(input) {
  const regex = /^[A-Za-zÀ-ÿ\s]+$/;
  return regex.test(input.value.trim());
}

function validateEmail(input) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(input.value.trim());
}

function validateAddress(input) {
  return input.value.trim().length >= 5;
}

function validatePhone(input) {
  return input.value.trim().length === 13; 
}

// =======================
// PHONE MASKING +370 6xx xxxxx
// =======================
fields.phone.addEventListener("input", () => {
  let v = fields.phone.value.replace(/\D/g, "");

  if (v.startsWith("370")) v = v.substring(3);
  if (v.startsWith("0")) v = v.substring(1);

  v = "+370 6" + v.substring(1, 3) + " " + v.substring(3, 8);
  fields.phone.value = v.substring(0, 13);
});

// =======================
// REAL-TIME CHECK
// =======================
document.querySelectorAll("#contactForm input").forEach(input => {
  input.addEventListener("input", validateForm);
});

function validateForm() {
  let valid =
    validateName(fields.name) &&
    validateName(fields.surname) &&
    validateEmail(fields.email) &&
    validatePhone(fields.phone) &&
    validateAddress(fields.address);

  submitBtn.disabled = !valid;
}

// =======================
// SUBMIT PROCESSING
// =======================
document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const data = {
    name: fields.name.value,
    surname: fields.surname.value,
    email: fields.email.value,
    phone: fields.phone.value,
    address: fields.address.value,
    rating1: Number(fields.rating1.value),
    rating2: Number(fields.rating2.value),
    rating3: Number(fields.rating3.value)
  };

  console.log(data);

  const avg =
    (data.rating1 + data.rating2 + data.rating3) / 3;

  const resultsDiv = document.getElementById("formResults");

  resultsDiv.innerHTML = `
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Surname:</strong> ${data.surname}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Phone:</strong> ${data.phone}</p>
    <p><strong>Address:</strong> ${data.address}</p>
    <p><strong>Average:</strong> <span id="avgValue">${avg.toFixed(2)}</span></p>
  `;

  const avgSpan = document.getElementById("avgValue");

  if (avg < 4) avgSpan.style.color = "red";
  else if (avg < 7) avgSpan.style.color = "orange";
  else avgSpan.style.color = "green";

  showPopup();
});

// =======================
// SUCCESS POPUP
// =======================
function showPopup() {
  const popup = document.createElement("div");
  popup.classList.add("form-popup");
  popup.textContent = "Form submitted successfully!";
  document.body.appendChild(popup);

  setTimeout(() => popup.remove(), 2000);
}
