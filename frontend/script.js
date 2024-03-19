let cropper;

function openCamera() {
    if (
        "mediaDevices" in navigator &&
        "getUserMedia" in navigator.mediaDevices
    ) {
        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then(function (stream) {
                const video = document.createElement("video");
                video.srcObject = stream;
                video.play();
                const preview =
                    document.getElementById("productPreview");
                preview.innerHTML = "";
                preview.appendChild(video);

                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                video.addEventListener(
                    "loadedmetadata",
                    function () {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                    }
                );
                video.addEventListener("play", function () {
                    const timerCallback = function () {
                        if (video.paused || video.ended) {
                            return;
                        }
                        context.drawImage(
                            video,
                            0,
                            0,
                            canvas.width,
                            canvas.height
                        );
                        setTimeout(timerCallback, 0);
                    };
                    timerCallback();
                });
                const captureButton =
                    document.createElement("button");
                captureButton.textContent = "Capture Photo";
                captureButton.addEventListener(
                    "click",
                    function () {
                        const imageData =
                            canvas.toDataURL("image/png");
                        const img = document.createElement("img");
                        img.src = imageData;
                        preview.innerHTML = "";
                        preview.appendChild(img);
                        cropper = new Cropper(img, {
                            aspectRatio: 1 / 1, // Set your desired aspect ratio
                            crop: function (event) {
                                // You can handle cropping events here if needed
                            },
                        });

                        const retakeButton =
                            document.createElement("button");
                        retakeButton.textContent = "Retake";
                        retakeButton.addEventListener(
                            "click",
                            function () {
                                preview.innerHTML = "";
                                preview.appendChild(video);
                                cropper = null;
                            }
                        );
                        preview.appendChild(retakeButton);

                        const saveButton =
                            document.createElement("button");
                        saveButton.textContent = "Remove Background";
                        saveButton.addEventListener(
                            "click",
                            function () {
                                removeBackground(img);
                                preview.innerHTML = "";
                                cropper = null;
                            }
                        );
                        preview.appendChild(saveButton);
                    }
                );
                preview.appendChild(captureButton);
            })
            .catch(function (error) {
                console.error("Error accessing the camera:", error);
                alert(
                    "Error accessing the camera. Please make sure your device supports it and any necessary permissions are granted."
                );
            });
    } else {
        alert("Camera access not supported in this browser.");
    }
}

function previewImage(event) {
    const preview = document.getElementById("productPreview");
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function () {
        const img = document.createElement("img");
        img.src = reader.result;
        img.alt = "Product Image";
        img.classList.add("fadeIn");
        preview.innerHTML = "";
        preview.appendChild(img);
        cropper = new Cropper(img, {
            aspectRatio: 1 / 1, // Set your desired aspect ratio
            crop: function (event) {
                // You can handle cropping events here if needed
            },
        });
    };

    if (file) {
        reader.readAsDataURL(file);
    }
}

function removeBackground(img) {
    if (cropper) {
        cropper.getCroppedCanvas().toBlob(function (blob) {
            var formData = new FormData();
            formData.append('image', blob);

            // Show the loader
            document.getElementById('loader').style.display = 'block';

            fetch('http://localhost:9080/remove_background', {
                method: 'POST',
                body: formData
            })
            .then(response => response.blob())
            .then(processedImage => {
                img.src = URL.createObjectURL(processedImage);

                // Hide the loader
                document.getElementById('loader').style.display = 'none';
            })
            .catch(error => {
                console.error('Error:', error);

                // Hide the loader
                document.getElementById('loader').style.display = 'none';
            });
        });
    }
}

document.getElementById('image-upload').addEventListener('change', function(event) {
    var file = event.target.files[0];
    var imageElement = document.getElementById('result-image');
    var url = URL.createObjectURL(file);
    imageElement.src = url;
});

document.getElementById('upload-form').addEventListener('submit', function(event) {
    event.preventDefault();
    var fileInput = document.getElementById('image-upload');
    var file = fileInput.files[0];
    var formData = new FormData();
    formData.append('image', file);

    // Show the loader
    document.getElementById('loader').style.display = 'block';

    fetch('http://localhost:9080/remove_background', {
        method: 'POST',
        body: formData
    })
    .then(response => response.blob())
    .then(processedImage => {
        var imageElement = document.getElementById('result-image');
        var url = URL.createObjectURL(processedImage);
        imageElement.src = url;

        // Hide the loader
        document.getElementById('loader').style.display = 'none';
    })
    .catch(error => {
        console.error('Error:', error);

        // Hide the loader
        document.getElementById('loader').style.display = 'none';
    });
});