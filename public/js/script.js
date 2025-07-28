(() => {
  'use strict';

  // Select all forms with class 'needs-validation'
  const forms = document.querySelectorAll('.needs-validation');

  // Apply custom Bootstrap validation styles on submit
  Array.from(forms).forEach((form) => {
    form.addEventListener('submit', (event) => {
      // Prevent submission if the form is invalid
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      // Add Bootstrap's validation class
      form.classList.add('was-validated');
    }, false);
  });
})();