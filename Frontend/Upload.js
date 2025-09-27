document.addEventListener("DOMContentLoaded", () => {
    const dropArea = document.getElementById("drop-area");
    const fileInput = document.getElementById("fileInput");
    const previewImage = document.getElementById("previewImage");
    const classifyButton = document.getElementById("classifyButton");
    const dropAreaText = document.getElementById("drop-area-text");
    const wasteInfoDiv = document.getElementById("wasteInfo");
    const wasteTitle = document.getElementById("wasteTitle");
    const wasteCategory = document.getElementById("wasteCategory");
    const wasteExplanation = document.getElementById("wasteExplanation");
    const wasteManagement = document.getElementById("wasteManagement");
    const wasteBin = document.getElementById("wasteBin");

    let uploadedFile = null;

    // Drag and Drop functionality
    ["dragenter", "dragover"].forEach(event => {
        dropArea.addEventListener(event, e => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.add("dragging");
        });
    });

    ["dragleave", "drop"].forEach(event => {
        dropArea.addEventListener(event, e => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.remove("dragging");
        });
    });

    dropArea.addEventListener("drop", e => {
        const files = e.dataTransfer.files;
        handleFileUpload(files[0]);
    });

    // Click to Upload
    dropArea.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
            handleFileUpload(fileInput.files[0]);
        }
    });

    // Handle File Upload
    function handleFileUpload(file) {
        if (file && file.type.startsWith("image/")) {
            uploadedFile = file;
            const reader = new FileReader();
            reader.onload = () => {
                previewImage.src = reader.result;
                previewImage.style.display = "block";
                classifyButton.style.display = "inline-block";
                classifyButton.disabled = false;
                dropAreaText.textContent = file.name;
                dropArea.style.height = "auto";
                dropArea.style.padding = "20px";
            };
            reader.readAsDataURL(file);
        } else {
            alert("Please upload a valid image file.");
        }
    }

    // Classify Image Button
    // Define the async function to handle the classify button click
    async function handleClassifyButtonClick(e) {
        e.preventDefault();
        if (!uploadedFile) {
            alert("Please upload an image first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", uploadedFile);

        // Inside the classifyButton click event
        const response = await fetch('http://127.0.0.1:5000/classify', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            alert(`Server responded with ${response.status}`);
            return;
        }

        const data = await response.json();

        // Log the response data to check if it's correct
        console.log("Received from backend:", data);

        // Check if the predicted class exists in the wasteInfo object
        if (data.class) {
            // Display classification result in a website alert

            // Show more detailed information about the waste
            if (wasteInfo[data.class]) {
                wasteTitle.textContent = data.class.replace(/_/g, " ").toUpperCase();
                wasteCategory.textContent = `Category: ${wasteInfo[data.class].category}`;
                wasteExplanation.textContent = `Why it is categorized: ${wasteInfo[data.class].explanation}`;
                wasteManagement.textContent = `How to manage: ${wasteInfo[data.class].management}`;
                wasteBin.textContent = `Bin: ${wasteInfo[data.class].bin}`;
                wasteInfoDiv.style.display = "block";
            } else {
                alert("No information available for the predicted class.");
            }
        } else {
            alert("No predicted class found.");
        }
    }

    // Attach the named function to the button click event
    classifyButton.addEventListener("click", handleClassifyButtonClick);


    // Waste Information Object
    const wasteInfo = {
    aerosol_cans: {
        category: "Hazardous Waste",
        explanation: "Aerosol cans contain pressurized contents that may be flammable, toxic, or reactive, requiring careful disposal.",
        management: "Dispose of empty aerosol cans in the recycling bin. If they contain any contents, take them to a hazardous waste facility.",
        bin: "Recycling Bin (if empty); Hazardous Waste Facility (if not empty)"
    },
    aluminum_food_cans: {
        category: "Recyclable Waste",
        explanation: "Aluminum is a valuable material that can be recycled indefinitely without loss of quality.",
        management: "Rinse the cans thoroughly before placing them in the recycling bin.",
        bin: "Recycling Bin"
    },
    aluminum_soda_cans: {
        category: "Recyclable Waste",
        explanation: "Aluminum soda cans are made of a metal that is highly recyclable and reduces the need for mining raw materials.",
        management: "Rinse the cans thoroughly before placing them in the recycling bin.",
        bin: "Recycling Bin"
    },
    cardboard_boxes: {
        category: "Recyclable Waste",
        explanation: "Cardboard is a biodegradable and recyclable material that can be reprocessed into new paper products.",
        management: "Flatten the boxes to save space and ensure they are clean and dry before recycling.",
        bin: "Recycling Bin"
    },
    cardboard_packaging: {
        category: "Recyclable Waste",
        explanation: "Clean cardboard packaging is suitable for recycling, reducing the need for new paper materials.",
        management: "Remove any tape, labels, or plastic, and ensure the cardboard is clean and dry before recycling.",
        bin: "Recycling Bin"
    },
    clothing: {
        category: "Reusable Waste",
        explanation: "Clothing in good condition can be reused or donated, reducing textile waste and conserving resources.",
        management: "Donate wearable clothing to charity or reuse. If damaged, take them to textile recycling centers.",
        bin: "Donation Center or Textile Recycling Bin"
    },
    coffee_grounds: {
        category: "Organic Waste",
        explanation: "Coffee grounds are biodegradable and rich in nutrients, making them ideal for composting.",
        management: "Add coffee grounds to compost or dispose of them in the organic waste bin.",
        bin: "Compost Bin or Organic Waste Bin"
    },
    disposable_plastic_cutlery: {
        category: "Non-Recyclable Waste",
        explanation: "Most disposable plastic cutlery is made from low-grade plastic that is not easily recyclable.",
        management: "Dispose of these in the trash as they are typically non-recyclable.",
        bin: "Trash Bin"
    },
    eggshells: {
        category: "Organic Waste",
        explanation: "Eggshells are biodegradable and rich in calcium, which makes them a valuable compost material.",
        management: "Add eggshells to compost or dispose of them in the organic waste bin.",
        bin: "Compost Bin or Organic Waste Bin"
    },
    food_waste: {
        category: "Organic Waste",
        explanation: "Food waste is biodegradable and breaks down into compost, providing nutrients for soil.",
        management: "Add food waste to compost if possible, or dispose of it in the organic waste bin.",
        bin: "Compost Bin or Organic Waste Bin"
    },
    glass_beverage_bottles: {
        category: "Recyclable Waste",
        explanation: "Glass can be recycled endlessly without losing purity or quality.",
        management: "Rinse the bottles and remove any caps before placing them in the recycling bin.",
        bin: "Recycling Bin"
    },
    glass_cosmetic_containers: {
        category: "Recyclable Waste",
        explanation: "Glass is a recyclable material that can be remelted and reshaped into new containers.",
        management: "Rinse the containers and ensure they are free of residue before recycling.",
        bin: "Recycling Bin"
    },
    glass_food_jars: {
        category: "Recyclable Waste",
        explanation: "Glass jars are durable and recyclable, making them an eco-friendly waste material.",
        management: "Rinse the jars thoroughly and remove any lids or caps before recycling.",
        bin: "Recycling Bin"
    },
    magazines: {
        category: "Recyclable Waste",
        explanation: "Magazines are made from high-grade paper that is suitable for recycling into new paper products.",
        management: "Recycle magazines as paper, ensuring they are clean and dry.",
        bin: "Recycling Bin"
    },
    newspaper: {
        category: "Recyclable Waste",
        explanation: "Newspapers are made from recyclable paper, reducing the need for raw pulp.",
        management: "Ensure the newspaper is dry and clean before recycling.",
        bin: "Recycling Bin"
    },
    office_paper: {
        category: "Recyclable Waste",
        explanation: "Office paper is made from high-quality material that can be recycled into new paper products.",
        management: "Recycle paper as long as it is clean and free of food or oil stains.",
        bin: "Recycling Bin"
    },
    paper_cups: {
        category: "Non-Recyclable Waste",
        explanation: "Most paper cups are lined with plastic, making them difficult to recycle.",
        management: "Dispose of used paper cups in the trash unless they are compostable and labeled as such.",
        bin: "Trash Bin (or Compost Bin if labeled compostable)"
    },
    plastic_cup_lids: {
        category: "Recyclable Waste",
        explanation: "Plastic lids are usually made from recyclable plastics, reducing the need for new plastic production.",
        management: "Rinse the lids if necessary and place them in the recycling bin.",
        bin: "Recycling Bin"
    },
    plastic_detergent_bottles: {
        category: "Recyclable Waste",
        explanation: "Plastic detergent bottles are typically made of recyclable plastics like HDPE or PET.",
        management: "Rinse the bottles thoroughly and ensure they are empty before recycling.",
        bin: "Recycling Bin"
    },
    plastic_food_containers: {
        category: "Recyclable Waste",
        explanation: "Plastic food containers are made of recyclable plastics if they are cleaned properly.",
        management: "Rinse food containers to remove residue before recycling.",
        bin: "Recycling Bin"
    },
    plastic_straws: {
        category: "Recyclable Waste",
        explanation: "Plastic soda bottles are made from PET, a highly recyclable plastic that reduces the need for new plastic production.",
        management: "Rinse the bottles thoroughly, remove caps, and place them in the recycling bin.",
        bin: "Recycling Bin"
    },
    plastic_soda_bottles: {
        category: "Recyclable Waste",
        explanation: "Plastic soda bottles are made from PET, a highly recyclable plastic that reduces the need for new plastic production.",
        management: "Rinse the bottles thoroughly, remove caps, and place them in the recycling bin.",
        bin: "Recycling Bin"
    },
    plastic_water_bottles: {
        category: "Recyclable Waste",
        explanation: "Plastic water bottles are made from PET, a highly recyclable plastic that reduces the need for new plastic production.",
        management: "Rinse the bottles thoroughly, remove caps, and place them in the recycling bin.",
        bin: "Recycling Bin"
    },
    plastic_shopping_bags: {
        category: "Non-Recyclable Waste",
        explanation: "Plastic shopping bags are usually made of low-density plastic that is not accepted by curbside recycling.",
        management: "Reuse plastic bags when possible, or take them to designated recycling drop-off points.",
        bin: "Plastic Bag Recycling Drop-Off (or Trash Bin if no option available)"
    },
    plastic_trash_bags: {
        category: "Non-Recyclable Waste",
        explanation: "Plastic trash bags are not recyclable through curbside programs.",
        management: "Dispose of plastic trash bags in the trash.",
        bin: "Trash Bin"
    },
    shoes: {
        category: "Reusable Waste",
        explanation: "Shoes in wearable condition can be reused or donated, extending their lifecycle.",
        management: "Donate wearable shoes to charity or reuse them. If damaged, look for shoe recycling programs.",
        bin: "Donation Center or Shoe Recycling Bin"
    },
    steel_food_cans: {
        category: "Recyclable Waste",
        explanation: "Steel cans are a highly recyclable material that can be turned into new steel products.",
        management: "Rinse thoroughly before placing in the recycling bin.",
        bin: "Recycling Bin"
    },
    styrofoam_cups: {
        category: "Non-Recyclable Waste",
        explanation: "Styrofoam is difficult to recycle and often ends up in landfills due to its lightweight and low recycling demand.",
        management: "Dispose of in the trash.",
        bin: "Trash Bin"
    },
    styrofoam_food_containers: {
        category: "Non-Recyclable Waste",
        explanation: "Styrofoam food containers are not accepted in curbside recycling programs.",
        management: "Dispose of in the trash.",
        bin: "Trash Bin"
    },
    tea_bags: {
        category: "Organic Waste",
        explanation: "Tea bags are biodegradable and break down into compost, providing nutrients to the soil.",
        management: "Add to the compost bin, removing any staples or plastic parts.",
        bin: "Compost Bin"
    }
};

});
