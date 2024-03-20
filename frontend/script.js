// Function to create the form dynamically
function createForm(data) {
    const formContainer = document.getElementById("form-container");
    formContainer.innerHTML = "";

    const form = document.createElement("form");
    form.id = "json-data-form";

    const dict = {
        "Product Id": "product_id",
        "Item Name": "item_name",
        "Product type": "product_type",
        Description: "description",
        "Brand Name": "brand_name",
        Country: "country",
        "Your Price": "your_price",
        Quantity: "quantity",
        "M.R.P": "mrp",
        FullFillment: "fulfillment",
        Manufacturer: "manufacturer",
        "Contact No.": "contact_no",
    };

    for (const key in data) {
        const label = document.createElement("label");
        label.for = key;
        label.textContent = key + ":";
        form.appendChild(label);

        if (
            [
                "Product Id",
                "Item Name",
                "Product type",
                "Description",
                "Brand Name",
                "Country",
                "FullFillment",
                "Manufacturer",
                "Contact No.",
            ].includes(key)
        ) {
            const textarea = document.createElement("textarea");
            textarea.id = key;
            textarea.name = key;
            textarea.value = data[key];
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
            form.appendChild(textarea);
            if (key === "Product Id") {
                saved_textarea = textarea;
            }
        } else {
            const numInput = document.createElement("input");
            numInput.id = key;
            numInput.name = key;
            numInput.type = "number";
            numInput.value = parseInt(data[key]);
            form.appendChild(numInput);
        }
    }

    const submitButton = document.createElement("input");
    submitButton.type = "submit";
    submitButton.value = "Download CSV";

    
    saved_textarea.addEventListener("input", function (event) {
        query = document.getElementById("Product Id").value;
        fetch(`http://localhost:9080/search_products/${query}`)
            .then((response) => {
                console.log(response);
                // Also log the http exception detail
                if (!response.ok) {
                    throw new Error("Product not found", response.text);
                }
                return response.json();
            })
            .then((data) => {
                //Find old update and add buttons and remove them
                const oldUpdateButton = document.getElementById("update-button");
                if (oldUpdateButton) {
                    oldUpdateButton.remove();
                }

                const oldAddButton = document.getElementById("add-button");
                if (oldAddButton) {
                    oldAddButton.remove();
                }

                const updateButton = document.createElement("button");
                updateButton.textContent = "Update Product";
                updateButton.id = "update-button";
                form.appendChild(updateButton);

                updateButton.addEventListener("click", (event) => {
                    event.preventDefault();

                    // Convert the form data to a JSON object
                    const formData = new FormData(form);
                    const data = Array.from(formData.entries()).reduce(
                        (obj, [key, value]) => {
                            obj[dict[key]] = value;
                            return obj;
                        },
                        {}
                    );

                    // Send the data to your API
                    fetch(
                        `http://localhost:9080/update_product/${data.product_id}`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(data),
                        }
                    )
                        .then((response) => response.json())
                        .then((data) => {
                            console.log(data);
                        });
                });
            })
            .catch((error) => {
                //Find old update and add buttons and remove them
                const oldUpdateButton = document.getElementById("update-button");
                if (oldUpdateButton) {
                    oldUpdateButton.remove();
                }

                const oldAddButton = document.getElementById("add-button");
                if (oldAddButton) {
                    oldAddButton.remove();
                }

                const addButton = document.createElement("button");
                addButton.id = "add-button";
                addButton.textContent = "Add Product";
                form.appendChild(addButton);

                addButton.addEventListener("click", (event) => {
                    event.preventDefault();

                    // Convert the form data to a JSON object
                    const formData = new FormData(form);
                    const data = Array.from(formData.entries()).reduce(
                        (obj, [key, value]) => {
                            obj[dict[key]] = value;
                            return obj;
                        },
                        {}
                    );

                    fetch("http://localhost:9080/add_product", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(data),
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            console.log(data);
                        });

                        });
                    });
    });

    const updateButton = document.createElement("button");
    updateButton.id = "update-button";
    updateButton.textContent = "Update Product";

    updateButton.addEventListener("click", (event) => {
        event.preventDefault();

        // Convert the form data to a JSON object
        const formData = new FormData(form);
        const data = Array.from(formData.entries()).reduce(
            (obj, [key, value]) => {
                obj[dict[key]] = value;
                return obj;
            },
            {}
        );

        // Send the data to your API
        fetch(`http://localhost:9080/update_product/${data.product_id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
            });
    });
    
    form.appendChild(submitButton);
    form.appendChild(updateButton);
    formContainer.appendChild(form);

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        // Convert the form data to CSV
        const formData = new FormData(form);
        const csv = Array.from(formData.entries())
            .map((entry) => entry.map((value) => `"${value}"`).join(","))
            .join("\n");

        // Download the CSV file
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "form-data.csv";
        link.click();

        // Clean up
        URL.revokeObjectURL(url);

        // Convert the form data to a JSON object
        const data = Array.from(formData.entries()).reduce(
            (obj, [key, value]) => {
                obj[dict[key]] = value;
                return obj;
            },
            {}
        );
    });

    form.scrollIntoView({ behavior: "smooth" });
}

let debounceTimeout;

document
    .getElementById("search-form")
    .addEventListener("input", function (event) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            event.preventDefault();
            // document.getElementById(
            //     "generate-listing-section"
            // ).style.display = "none";

            const query = document.getElementById("search-query").value;

            fetch(`http://localhost:9080/search_products/${query}`)
                .then((response) => {
                    console.log(response);
                    // Also log the http exception detail
                    if (!response.ok) {
                        throw new Error("Product not found", response.text);
                    }
                    return response.json();
                })
                .then((data) => {
                    // Create a select element
                    // Check if a select element already exists
                    const oldSelect = document.getElementById("product-select");
                    if (oldSelect) {
                        // If it does, remove it
                        oldSelect.remove();
                    }

                    const oldButton =
                        document.getElementById("add-listing-button");
                    if (oldButton) {
                        oldButton.remove();
                    }

                    const select = document.createElement("select");
                    select.id = "product-select";

                    const defaultOption = document.createElement("option");
                    defaultOption.value = "";
                    defaultOption.textContent = "Select one option";
                    select.appendChild(defaultOption);

                    // Create an option for the product details
                    data.products.forEach((product) => {
                        const productOption = document.createElement("option");
                        productOption.value = JSON.stringify(product);
                        productOption.textContent = `Product: ${product["Item Name"]}`;
                        select.appendChild(productOption);
                    });

                    // Create an option for adding a new listing
                    const newListingOption = document.createElement("option");
                    newListingOption.value = "new";
                    newListingOption.textContent = "Add new listing";
                    select.appendChild(newListingOption);

                    // Append the select element to the product details div
                    const productDetails =
                        document.getElementById("product-details");
                    productDetails.appendChild(select);

                    select.addEventListener("change", function () {
                        if (this.value !== "new") {
                            const selectedProduct = JSON.parse(this.value);
                            createForm(selectedProduct);
                            document.getElementById(
                                "generate-listing-section"
                            ).style.display = "none";
                        } else {
                            // Clear the form container
                            const formContainer =
                                document.getElementById("form-container");
                            formContainer.innerHTML = "";
                            document.getElementById(
                                "generate-listing-section"
                            ).style.display = "block";
                        }
                    });
                })
                .catch((error) => {
                    // If the product is not found, go through the current workflow
                    const oldSelect = document.getElementById("product-select");
                    if (oldSelect) {
                        // If it does, remove it
                        oldSelect.remove();
                    }

                    const oldButton =
                        document.getElementById("add-listing-button");
                    if (oldButton) {
                        oldButton.remove();
                    }

                    const button = document.createElement("button");
                    button.id = "add-listing-button";
                    button.textContent = "Add new listing";

                    const productDetails =
                        document.getElementById("product-details");
                    productDetails.appendChild(button);

                    button.addEventListener("click", function () {
                        // Clear the form container
                        const formContainer =
                            document.getElementById("form-container");
                        formContainer.innerHTML = "";
                        document.getElementById(
                            "generate-listing-section"
                        ).style.display = "block";
                    });
                });
        }, 500);
    });

document
    .getElementById("upload-form")
    .addEventListener("submit", async function (event) {
        event.preventDefault();
        const fileInput = document.getElementById("image-upload");
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append("image", file);

        loader.style.display = "block";

        try {
            const removeBackgroundResponse = await fetch(
                "http://localhost:9080/remove_background",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const processedImage = await removeBackgroundResponse.blob();

            loader.style.display = "none";

            const imageElement = document.getElementById("processed-image");
            const imageUrl = URL.createObjectURL(processedImage);
            imageElement.src = imageUrl;

            loader.style.display = "block";

            const generateBlogPostResponse = await fetch(
                "http://localhost:9080/generate_blog_post",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await generateBlogPostResponse.json();

            const data2 = {
                "Brand Name": "XYZ",
                "Product Id": "5495152119519",
                Country: "India",
                "Your Price": "250",
                Quantity: "10",
                "M.R.P": "500",
                FullFillment: "Amazon Fullfilled",
                Manufacturer: "XYZ Pvt Ltd",
                "Contact No.": "65415465",
            };

            Object.assign(data, data2);

            loader.style.display = "none";

            const formContainer = document.getElementById("form-container");

            // Create the form with the generated data
            createForm(data);
        } catch (error) {
            console.error("Error:", error);
            loader.style.display = "none";
        }
    });

document
    .getElementById("image-upload")
    .addEventListener("change", function (event) {
        const imagePreview = document.getElementById("image-preview");
        const file = event.target.files[0];
        const imageUrl = URL.createObjectURL(file);
        imagePreview.src = imageUrl;
    });

window.onload = function () {
    document.getElementById("image-upload").value = "";
};
