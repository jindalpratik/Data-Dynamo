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
                    "Brand Name": "XYZ",
                    "Product Id": "5495152119519",
                    "Country": "India",
                    "Your Price": "250",
                    "Quantity": "10",
                    "M.R.P": "500",
                    "FullFillment": "Amazon Fullfilled",
                    "Manufacturer": "XYZ Pvt Ltd",
                    "Contact No.": "65415465",
                });

                dict = ({
                    "Product Id":'product_id',
                    "Item Name":'item_name',
                    "Product type":'product_type',
                    "Description":'description',
                    "Brand Name":'brand_name',
                    'Country': 'country',
                    'Your Price': 'your_price',
                    'Quantity': 'quantity',
                    'M.R.P': 'mrp',
                    'FullFillment': 'fulfillment',
                    'Manufacturer': 'manufacturer',
                    'Contact No.': "contact_no"
                })

                data = {...data, ...data2}
                for (const key in data) {
                    const label = document.createElement("label");
                    label.for = key;
                    label.textContent = key + ":";
                    // console.log(key);
                    form.appendChild(label);

                    if (["Product Id", "Item Name", "Product type", "Description", "Brand Name", "Country", "FullFillment", "Manufacturer", "Contact No."].includes(key)) {
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

                        form.appendChild(textarea);
                    } else {
                        let num_input = document.createElement('input');
                        num_input.id = key;
                        num_input.name = key;
                        num_input.type = 'number';  
                        num_input.value = parseInt(data[key]);
                        form.appendChild(num_input);
                    }
                }

                const submitButton = document.createElement("input");
                submitButton.type = "submit";
                submitButton.value = "Download CSV";

                form.appendChild(submitButton);

                formContainer.appendChild(form);

                
                form.addEventListener('submit', function(event) {
                    event.preventDefault();

                    // Convert the form data to CSV
                    const formData = new FormData(form);
                    const csv = Array.from(formData.entries())
                        .map(entry => entry.map(value => `"${value}"`).join(','))
                        .join('\n');

                    // Download the CSV file
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'form-data.csv';
                    link.click();

                    // Clean up
                    URL.revokeObjectURL(url);
                });

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
