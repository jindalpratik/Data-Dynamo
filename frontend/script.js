const imageUpload = document.getElementById("image-upload");
const imagePreview = document.getElementById("image-preview");

imageUpload.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            imagePreview.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document
    .getElementById("upload-form")
    .addEventListener("submit", function (event) {
        event.preventDefault();
        var fileInput = document.getElementById("image-upload");
        var file = fileInput.files[0];
        var formData = new FormData();
        formData.append("image", file);

        document.getElementById('loader').style.display = 'block';
        fetch("http://localhost:9080/remove_background", {
            method: "POST",
            body: formData,
        })
            .then((response) => response.blob())
            .then((image) => {
                document.getElementById('loader').style.display = 'none';
                var imageElement = document.getElementById("processed-image");
                var url = URL.createObjectURL(image);
                imageElement.src = url;

                document.getElementById('loader').style.display = 'block';
                return fetch("http://localhost:9080/generate_blog_post", {
                    method: "POST",
                    body: formData,
                });
            })
            .then((response) => response.json())
            .then((data) => {
                document.getElementById('loader').style.display = 'none';

                const formContainer = document.getElementById("form-container");

                const form = document.createElement("form");
                form.id = "json-data-form";

                // Clear the form container
                formContainer.innerHTML = "";
                data2 = ({
                    "Brand Name": "",
                    "Product Id": "",
                    "Country": "India",
                    "Your Price": "",
                    "Quantity": "",
                    "M.R.P": "",
                    "FullFillment": "",
                    "Manufacturer": "",
                    "Contact No.": "",
                });

                data = {...data, ...data2}
                for (const key in data) {
                    const label = document.createElement("label");
                    label.for = key;
                    label.textContent = key + ":";

                    const textarea = document.createElement("textarea");
                    textarea.id = key;
                    textarea.name = key;
                    textarea.value = data[key];

                    const adjustHeight = () => {
                        textarea.style.height = 'auto';
                        textarea.style.height = textarea.scrollHeight + 'px';
                    };
                
                    // Adjust the height immediately
                    adjustHeight();

                    form.appendChild(label);
                    form.appendChild(textarea);
                }

                const submitButton = document.createElement("input");
                submitButton.type = "submit";
                submitButton.value = "Update";

                form.appendChild(submitButton);

                formContainer.appendChild(form);

                // Scroll to the form
                form.scrollIntoView({ behavior: "smooth" });
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    });

window.onload = function () {
    document.getElementById("image-upload").value = "";
};
