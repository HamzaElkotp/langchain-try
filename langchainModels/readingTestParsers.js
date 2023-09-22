import { config } from "dotenv";
config();

import {z} from "zod"
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";

// With a `StructuredOutputParser` we can define a schema for the output.
const parser = StructuredOutputParser.fromNamesAndDescriptions({
    title: z.string().describe("title of the paragraph"),
    paragraph: z.string().describe("paragraph itself"),
    allquestions: z.array(
        z.object({
            question: z.string().describe("the question"),
            options: z.array(z.string().describe("string contain each single option")).describe("array contain string for each single option"),
            correct: z.string().describe("the text of the correct answer of the question")
        }).describe("object for each single question to contain all its data")
    ).describe("array to contains all questions objects, with all their data")
});


const formatInstructions = parser.getFormatInstructions();

const prompt = new PromptTemplate({
    template: 
    "Generate IELTS reading part 1 like test with 5 questions, 3 options for each question and one true answer for each question. the reading paragraph should be at least 400 words, about this topic: \n{format_instructions}\n{topic}",
    inputVariables: ["topic"],
    partialVariables: { format_instructions: formatInstructions },
});

const model = new OpenAI({ temperature: 0, maxTokens: 3000 });

async function generate_reading_quiz(topic){
    const input = await prompt.format({
        topic: topic,
    });
    const response = await model.call(input);

    console.log(response)
    
    let formated = response.replace(":\n\n```json", "").replace("```","")
    if(formated.split("}\n\n")[1] == undefined){
        console.log(JSON.parse(formated));
        return JSON.parse(formated)
    }else{
        console.log(JSON.parse(formated.split("}\n\n")[1]));
        return JSON.parse(formated.split("}\n\n")[1])
    }
}

generate_reading_quiz('Marketing');

export default generate_reading_quiz