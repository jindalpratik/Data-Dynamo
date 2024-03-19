

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
    .then(response => response.text())
    .then(data => {
        document.getElementById('blog-post').innerText = data;
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});