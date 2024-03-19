const imageUpload = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');

imageUpload.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            imagePreview.src = event.target.result;
        }
        reader.readAsDataURL(file);
    }
});

document.getElementById('upload-form').addEventListener('submit', function(event) {
    event.preventDefault();
    var fileInput = document.getElementById('image-upload');
    var file = fileInput.files[0];
    var formData = new FormData();
    formData.append('image', file);

    fetch('http://localhost:9080/remove_background', {
        method: 'POST',
        body: formData
    })
    .then(response => response.blob())
    .then(image => {
        var imageElement = document.getElementById('processed-image');
        var url = URL.createObjectURL(image);
        imageElement.src = url;

        return fetch('http://localhost:9080/generate_blog_post', {
            method: 'POST',
            body: formData
        });
    })
    .then(response => response.json())
    .then(data => {
        const formContainer = document.getElementById('form-container');

        const form = document.createElement('form');
        form.id = 'json-data-form';

        // Clear the form container
        formContainer.innerHTML = '';

        for (const key in data) {
            const label = document.createElement('label');
            label.for = key;
            label.textContent = key + ':';

            const input = document.createElement('input');
            input.type = 'text';
            input.id = key;
            input.name = key;
            input.value = data[key];

            form.appendChild(label);
            form.appendChild(input);
        }

        const submitButton = document.createElement('input');
        submitButton.type = 'submit';
        submitButton.value = 'Update';

        form.appendChild(submitButton);

        formContainer.appendChild(form);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

window.onload = function() {
    document.getElementById('image-upload').value = '';
};