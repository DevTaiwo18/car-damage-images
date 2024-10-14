import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// Base URL for your GitHub repository (replace with your GitHub username and repo)
const githubBaseUrl = 'https://raw.githubusercontent.com/DevTaiwo18/car-damage-images/main/OBA.ai%20Photos';

// Path to the folder containing your subfolders with images
const baseImageFolder = path.join(process.cwd(), 'OBA.ai Photos');
const outputFile = path.join(process.cwd(), 'cardata.jsonl');

// Expanded questions for car damage analysis and image quality
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
    // Image quality questions
    "Is this image too blurry to analyze?",
    "Does this image have enough light to capture the damage?",
    "Is the damage visible enough in this image?",
    "Do we need a closer shot to see the damage?",
    "Is this a wide-angle shot as requested?",
    "Is this a close-up image of the damage?",
    "Do we need to retake this image for clarity?"
];

// Possible responses for car damage analysis
const damageResponses = [
    "The damage is visible, and it's a dent on the rear door.",
    "There is a deep scratch on the front bumper, which will likely require a full repaint.",
    "The car has a minor dent on the right side, but it should be easy to repair.",
    "This looks like a major dent near the wheel arch, which may affect the car's structural integrity.",
    "The damage appears to be cosmetic only and does not seem to affect the car's performance.",
    "This dent on the rear bumper is about 5 cm deep and may require replacement of the part."
];

// Possible responses for image quality feedback
const qualityResponses = [
    "This image is too blurry; please retake the photo.",
    "The lighting in this image is poor. Please ensure better lighting.",
    "The damage is too far away to be analyzed. Please take a closer shot.",
    "The image quality is good, and the damage is clearly visible.",
    "This is a close-up shot of the damage; it's clear.",
    "The image appears too dark to capture the details of the damage."
];

// Function to randomly pick a response type
function getAssistantResponse(folder) {
    const isQualityIssue = folder.toLowerCase().includes('blur') || folder.toLowerCase().includes('low-light');

    // If the folder name indicates a quality issue, prioritize quality responses
    if (isQualityIssue) {
        return qualityResponses[Math.floor(Math.random() * qualityResponses.length)];
    }

    // Otherwise, return a damage-related response
    return damageResponses[Math.floor(Math.random() * damageResponses.length)];
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
                                    content: getAssistantResponse(folder)
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
