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
const form = document.getElementById("contactForm");
const resultsDiv = document.getElementById("formResults");

// =======================
// VALIDATION HELPERS
// =======================
function setError(input, message) {
  const group = input.parentElement;
  const errorElem = group.querySelector(".error-message");
  if (errorElem) errorElem.textContent = message;
  input.classList.add("is-invalid");
  input.classList.remove("is-valid");
}

function clearError(input) {
  const group = input.parentElement;
  const errorElem = group.querySelector(".error-message");
  if (errorElem) errorElem.textContent = "";
  input.classList.remove("is-invalid");
  input.classList.add("is-valid");
}

function validateNameField(input) {
  const value = input.value.trim();
  if (value === "") {
    setError(input, "This field is required.");
    return false;
  }
  const regex = /^[A-Za-zÀ-ÿ\s]+$/;
  if (!regex.test(value)) {
    setError(input, "Only letters are allowed.");
    return false;
  }
  clearError(input);
  return true;
}

function validateEmailField(input) {
  const value = input.value.trim();
  if (value === "") {
    setError(input, "Email is required.");
    return false;
  }
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(value)) {
    setError(input, "Invalid email format.");
    return false;
  }
  clearError(input);
  return true;
}

function validateAddressField(input) {
  const value = input.value.trim();
  if (value === "") {
    setError(input, "Address is required.");
    return false;
  }
  if (value.length < 5) {
    setError(input, "Address is too short.");
    return false;
  }
  clearError(input);
  return true;
}

function validateRatingField(input) {
  const value = input.value.trim();
  const num = Number(value);
  if (value === "") {
    setError(input, "Rating is required.");
    return false;
  }
  if (isNaN(num) || num < 1 || num > 10) {
    setError(input, "Enter a number between 1 and 10.");
    return false;
  }
  clearError(input);
  return true;
}

function validatePhoneField(input) {
  const value = input.value.trim();
  if (value === "") {
    setError(input, "Phone number is required.");
    return false;
  }
  const digits = value.replace(/\D/g, "");
  // Should be in format +370 6xx xxxxx → digits "3706" + 7 numbers => length 11
  if (!digits.startsWith("3706") || digits.length !== 11) {
    setError(input, "Use format +370 6xx xxxxx.");
    return false;
  }
  clearError(input);
  return true;
}

// =======================
// PHONE MASKING (real-time)
// =======================
fields.phone.addEventListener("input", (e) => {
  let digits = e.target.value.replace(/\D/g, "");

  // drop leading 00 if written as 00370...
  if (digits.startsWith("00")) {
    digits = digits.substring(2);
  }

  // ensure it starts with 3706
  if (digits.startsWith("3706")) {
    // ok
  } else if (digits.startsWith("370")) {
    // user wrote 370 + something, enforce 6
    digits = "3706" + digits.substring(3);
  } else if (digits.startsWith("6")) {
    // local Lithuanian 6...
    digits = "370" + digits;
  } else if (digits === "") {
    e.target.value = "";
    validateField(e.target);
    toggleSubmitButton();
    return;
  } else {
    // if weird, just force 3706 prefix
    digits = "3706" + digits;
  }

  // keep only 11 digits total (3706 + 7)
  digits = digits.substring(0, 11);

  const base = digits.substring(0, 4); // "3706"
  const rest = digits.substring(4);    // up to 7 digits

  const part1 = rest.substring(0, 2);
  const part2 = rest.substring(2, 7);

  let formatted = "+370 6";
  if (part1) formatted += part1;
  if (part2) formatted += " " + part2;

  e.target.value = formatted;
  validateField(e.target);
  toggleSubmitButton();
});

// =======================
// FIELD-SPECIFIC VALIDATION ROUTER
// =======================
function validateField(input) {
  switch (input.id) {
    case "name":
    case "surname":
      return validateNameField(input);
    case "email":
      return validateEmailField(input);
    case "address":
      return validateAddressField(input);
    case "phone":
      return validatePhoneField(input);
    case "rating1":
    case "rating2":
    case "rating3":
      return validateRatingField(input);
    default:
      return true;
  }
}

// Attach real-time validation
document.querySelectorAll("#contactForm input").forEach((input) => {
  input.addEventListener("input", () => {
    validateField(input);
    toggleSubmitButton();
  });
});

// =======================
// FORM-WIDE VALIDATION
// =======================
function isFormValid() {
  let valid = true;
  valid = validateField(fields.name) && valid;
  valid = validateField(fields.surname) && valid;
  valid = validateField(fields.email) && valid;
  valid = validateField(fields.phone) && valid;
  valid = validateField(fields.address) && valid;
  valid = validateField(fields.rating1) && valid;
  valid = validateField(fields.rating2) && valid;
  valid = validateField(fields.rating3) && valid;
  return valid;
}

function toggleSubmitButton() {
  submitBtn.disabled = !isFormValid();
}

// =======================
// SUBMIT HANDLER
// =======================
form.addEventListener("submit", function (e) {
  e.preventDefault();

  // double-check all validation before processing
  if (!isFormValid()) {
    toggleSubmitButton();
    return;
  }

  const data = {
    name: fields.name.value.trim(),
    surname: fields.surname.value.trim(),
    email: fields.email.value.trim(),
    phone: fields.phone.value.trim(),
    address: fields.address.value.trim(),
    rating1: Number(fields.rating1.value),
    rating2: Number(fields.rating2.value),
    rating3: Number(fields.rating3.value)
  };

  // Required: print object in console
  console.log("Form data:", data);

  const avg = (data.rating1 + data.rating2 + data.rating3) / 3;

  // Required: show data below form
  resultsDiv.innerHTML = `
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Surname:</strong> ${data.surname}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Phone number:</strong> ${data.phone}</p>
    <p><strong>Address:</strong> ${data.address}</p>
    <p><strong>Average rating:</strong> <span id="avgValue">${avg.toFixed(2)}</span></p>
    <p><strong>${data.name} ${data.surname}:</strong> ${avg.toFixed(2)}</p>
  `;

  // Color-code average
  const avgSpan = document.getElementById("avgValue");
  const avgNumber = avg;

  if (avgNumber < 4) {
    avgSpan.style.color = "red";
  } else if (avgNumber < 7) {
    avgSpan.style.color = "orange";
  } else {
    avgSpan.style.color = "green";
  }

  // Success popup
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

  setTimeout(() => {
    popup.remove();
  }, 2000);
}
