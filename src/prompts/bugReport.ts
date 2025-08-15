import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {z} from "zod";
import {logger} from "../infrastructure/logger.js";


export function bugReportPrompt(server:McpServer) {
    server.registerPrompt(
        "bug_report_prompt",
        {
            title: `JIRA Bug Report Prompt`,
            description: 'In case of a BUG Issue, please provide the expected result, actual result and steps to reproduce the issue',
            argsSchema: {expectedResult: z.string(), actualResult: z.string().optional(), stepsToReproduce: z.string()},
        },
        ({ expectedResult, actualResult, stepsToReproduce }) => {
            let prompt = `In case of a bug issue, please provide the expected and actual results which are optional. Those should be provided from the user's input.\n**Expected Result**: ${expectedResult}`

            if (actualResult) {
                prompt += `\n**Actual Result**: ${actualResult}`;
            }

            prompt += `\nThe prompt should also include the steps to reproduce, which should also be in the user's input \n**Steps to Reproduce**: ${stepsToReproduce}.
            \nPlease provide a detailed description of the bug, including any relevant information that can help in diagnosing the issue.\n
            You can also detail the user's input if it is not well written.`;

            logger.info('bugReportPrompt has been called', {expectedResult, actualResult, stepsToReproduce});

            return {
                    messages: [{
                    role: "user",
                    content: {
                        type: "text",
                        text: prompt
                    }
                }]
            }
        }
    )
}