import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// Base URL for your GitHub repository (replace with your GitHub username and repo)
const githubBaseUrl = 'https://raw.githubusercontent.com/DevTaiwo18/car-damage-images/main/OBA.ai%20Photos';

// Path to the folder containing your subfolders with images
const baseImageFolder = path.join(process.cwd(), 'OBA.ai Photos');
const outputFile = path.join(process.cwd(), 'cardata.jsonl');

// Expanded questions for car damage analysis, including questions about image quality
const questions = [
    "What type of damage is this?",
    "Is this repairable?",
    "How severe is the damage?",
    "Which part of the car is damaged?",
    "What is the estimated repair cost for this damage?",
    "Is this damage cosmetic or structural?",
    "Does this damage affect the vehicle’s performance?",
    "What tools or materials are needed to fix this damage?",
    "Would this damage be covered under insurance?",
    "Can this damage lead to more serious problems if left unfixed?",
    "How long would it take to repair this damage?",
    "Is this a common type of damage for this car model?",
    "What caused this damage?",
    "Can this part of the car be replaced easily?",
    "Is this damage dangerous to drive with?",
    "What is the approximate age of the damage?",
    "Does the damage impact the car's resale value?",
    "What parts of the car will need to be checked after this type of damage?",
    "Does this damage affect the safety of the vehicle?",
    "Can this damage be fixed with DIY methods, or does it require a professional?",
    // New questions related to image quality
    "Is this image too blurry to analyze?",
    "Does this image have enough light to capture the damage?",
    "Is the damage visible enough in this image?",
    "Do we need a closer shot to see the damage?",
    "Is this a wide-angle shot as requested?",
    "Is this a close-up image of the damage?",
    "Do we need to retake this image for clarity?"
];

// Possible responses the assistant might provide based on the analysis
const assistantResponses = [
    "The damage is visible, and it's a dent on the rear door.",
    "This image is too blurry; please retake the photo.",
    "The lighting in this image is poor. Please ensure better lighting.",
    "The damage is too far away to be analyzed. Please take a closer shot.",
    "The image quality is good, and the damage is clearly visible.",
    "This is a close-up shot of the damage; it's clear.",
    "The damage captured is minor, and the repair looks simple."
];

// Function to randomly pick an assistant response
function getAssistantResponse() {
    return assistantResponses[Math.floor(Math.random() * assistantResponses.length)];
}

// Function to generate JSONL content with GitHub URLs
function generateDataset() {
    fs.readdir(baseImageFolder, (err, folders) => {
        if (err) {
            console.error(chalk.red('Error reading base image folder:'), err);
            return;
        }

        const jsonlEntries = [];

        // Loop through each folder (category)
        folders.forEach((folder) => {
            const folderPath = path.join(baseImageFolder, folder);

            if (fs.lstatSync(folderPath).isDirectory()) {
                fs.readdir(folderPath, (err, files) => {
                    if (err) {
                        console.error(chalk.red('Error reading folder:'), err);
                        return;
                    }

                    files.forEach((file) => {
                        const imagePathOnGitHub = `${githubBaseUrl}/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`;

                        // Add a JSONL entry for each image with GitHub URL
                        jsonlEntries.push(JSON.stringify({
                            messages: [
                                {
                                    role: "system",
                                    content: "You are an assistant that identifies car damage and assesses image quality."
                                },
                                {
                                    role: "user",
                                    content: [
                                        {
                                            type: "image_url",
                                            image_url: {
                                                url: imagePathOnGitHub
                                            }
                                        },
                                        {
                                            type: "text",
                                            text: `${questions[Math.floor(Math.random() * questions.length)]} (Category: ${folder})`
                                        }
                                    ]
                                },
                                {
                                    role: "assistant",
                                    content: getAssistantResponse()
                                }
                            ]
                        }));
                    });

                    // After processing all images, write the entries to the JSONL file
                    if (folders.indexOf(folder) === folders.length - 1) {
                        fs.writeFileSync(outputFile, jsonlEntries.join('\n'));
                        console.log(chalk.green(`Dataset has been written to ${outputFile}`));
                    }
                });
            }
        });
    });
}

// Run the function to generate the dataset
generateDataset();
