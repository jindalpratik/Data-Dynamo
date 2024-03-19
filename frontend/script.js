const imageUpload = document.getElementById("image-upload");
const imagePreview = document.getElementById("image-preview");
const loader = document.getElementById('loader');

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

document.getElementById("upload-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    const fileInput = document.getElementById("image-upload");
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("image", file);

    loader.style.display = 'block';

    try {
        const removeBackgroundResponse = await fetch("http://localhost:9080/remove_background", {
            method: "POST",
            body: formData,
        });

        const processedImage = await removeBackgroundResponse.blob();

        loader.style.display = 'none';

        const imageElement = document.getElementById("processed-image");
        const imageUrl = URL.createObjectURL(processedImage);
        imageElement.src = imageUrl;

        loader.style.display = 'block';

        const generateBlogPostResponse = await fetch("http://localhost:9080/generate_blog_post", {
            method: "POST",
            body: formData,
        });

        const data = await generateBlogPostResponse.json();

        loader.style.display = 'none';

        const formContainer = document.getElementById("form-container");
        formContainer.innerHTML = "";

        const form = document.createElement("form");
        form.id = "json-data-form";

        const data2 = {
            "Brand Name": "XYZ",
            "Product Id": "5495152119519",
            "Country": "India",
            "Your Price": "250",
            "Quantity": "10",
            "M.R.P": "500",
            "FullFillment": "Amazon Fullfilled",
            "Manufacturer": "XYZ Pvt Ltd",
            "Contact No.": "65415465",
        };

        const dict = {
            "Product Id": 'product_id',
            "Item Name": 'item_name',
            "Product type": 'product_type',
            "Description": 'description',
            "Brand Name": 'brand_name',
            'Country': 'country',
            'Your Price': 'your_price',
            'Quantity': 'quantity',
            'M.R.P': 'mrp',
            'FullFillment': 'fulfillment',
            'Manufacturer': 'manufacturer',
            'Contact No.': "contact_no"
        };

        Object.assign(data, data2);

        for (const key in data) {
            const label = document.createElement("label");
            label.for = key;
            label.textContent = key + ":";
            form.appendChild(label);

            if (["Product Id", "Item Name", "Product type", "Description", "Brand Name", "Country", "FullFillment", "Manufacturer", "Contact No."].includes(key)) {
                const textarea = document.createElement("textarea");
                textarea.id = key;
                textarea.name = key;
                textarea.value = data[key];
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
                form.appendChild(textarea);
            } else {
                const numInput = document.createElement('input');
                numInput.id = key;
                numInput.name = key;
                numInput.type = 'number';
                numInput.value = parseInt(data[key]);
                form.appendChild(numInput);
            }
        }

        const submitButton = document.createElement("input");
        submitButton.type = "submit";
        submitButton.value = "Download CSV";
        form.appendChild(submitButton);
        formContainer.appendChild(form);

        form.addEventListener('submit', function (event) {
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

        form.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
        console.error("Error:", error);
        loader.style.display = 'none';
    }
});

window.onload = function () {
    document.getElementById("image-upload").value = "";
};
