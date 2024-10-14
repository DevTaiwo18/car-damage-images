import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// Base URL for your GitHub repository
const githubBaseUrl = 'https://raw.githubusercontent.com/DevTaiwo18/car-damage-images/main/OBA.ai%20Photos';

const baseImageFolder = path.join(process.cwd(), 'OBA.ai Photos');
const outputFile = path.join(process.cwd(), 'cardatav3.jsonl');

// Expanded questions focusing on car damage analysis
const questions = [
    "How many dents are visible in this image?",
    "What is the size of the largest dent?",
    "Which part of the car is damaged?",
    "How severe is the damage?",
    "Does this damage affect the vehicle’s performance?",
    "What is the estimated repair cost for this damage?",
    "Can this damage lead to more serious problems if left unfixed?",
    "Would this damage be covered under insurance?"
];

// Possible responses focusing on damage analysis
const damageResponses = [
    "This image shows 3 dents. The largest dent is the size of a quarter.",
    "The front bumper has a deep dent, approximately the size of a half-dollar.",
    "There is a minor dent near the wheel arch, which shouldn't affect performance.",
    "The rear door has a severe dent, which may require replacement.",
    "The damage is mostly cosmetic, with scratches and a small dent on the hood."
];

// Function to randomly pick a damage-related response
function getAssistantResponse() {
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
                                    content: "You are an AI that analyzes car damage and provides detailed damage reports."
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

                    // Write the entries to the JSONL file
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
