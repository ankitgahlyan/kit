/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import fs from 'fs/promises';
import path from 'path';

import * as prettier from 'prettier';

import { extractSamplesFromFile } from './extract-samples';

type Placeholder = {
    raw: string;
    body: string;
    filePath: string;
    sampleName: string;
};

async function formatSampleCode(sample: string): Promise<string> {
    const trimmed = sample.trim();
    if (trimmed === '') {
        return '';
    }

    const config = await prettier.resolveConfig(process.cwd());
    const formatted = await prettier.format(trimmed, {
        ...config,
        parser: 'typescript',
    });
    return formatted.trimEnd();
}

async function findTemplateFiles(): Promise<string[]> {
    const templateDir = path.resolve('template');
    try {
        const stat = await fs.stat(templateDir);
        if (!stat.isDirectory()) {
            return [];
        }
    } catch {
        return [];
    }

    const entries = await fs.readdir(templateDir);
    return entries.filter((name) => name.endsWith('.md')).map((name) => path.join(templateDir, name));
}

function parsePlaceholders(content: string): Placeholder[] {
    const placeholders: Placeholder[] = [];
    const re = /%([^%\n]+)%/g;
    let match: RegExpExecArray | null;

    while ((match = re.exec(content)) !== null) {
        const raw = match[0];
        const body = match[1].trim();
        const matchIndex = match.index;

        const beforeText = content.slice(0, matchIndex);
        const afterText = content.slice(matchIndex + raw.length);
        const lastBacktickBefore = beforeText.lastIndexOf('`');
        const firstBacktickAfter = afterText.indexOf('`');

        if (lastBacktickBefore !== -1 && firstBacktickAfter !== -1) {
            const textBetween = content.slice(lastBacktickBefore + 1, matchIndex + raw.length + firstBacktickAfter);
            if (!textBetween.includes('\n') || textBetween.split('\n').length <= 3) {
                continue;
            }
        }

        const [filePart, sampleName] = body.split('#');
        if (!filePart || !sampleName) {
            throw new Error(`Invalid placeholder "${raw}". Expected format %../examples/src/file.ts#SAMPLE_NAME%`);
        }

        let normalizedFile: string;
        if (filePart.startsWith('../examples/src/')) {
            normalizedFile = filePart;
        } else if (filePart.startsWith('./examples/src/')) {
            const relativePath = filePart.replace(/^\.\//, '');
            normalizedFile = path.posix.join('..', relativePath);
        } else if (filePart.startsWith('examples/src/')) {
            normalizedFile = path.posix.join('..', filePart);
        } else {
            continue;
        }

        placeholders.push({
            raw,
            body,
            filePath: normalizedFile,
            sampleName,
        });
    }

    return placeholders;
}

async function resolvePlaceholder(
    cwd: string,
    placeholder: Placeholder,
    sampleCache: Map<string, Map<string, string>>,
): Promise<string> {
    const filePath = path.resolve(cwd, placeholder.filePath);

    let fileSamples = sampleCache.get(filePath);
    if (!fileSamples) {
        const { samples } = await extractSamplesFromFile(filePath);
        fileSamples = samples;
        sampleCache.set(filePath, fileSamples);
    }

    let sample = fileSamples.get(placeholder.sampleName);

    // SAMPLE_NAME_1, SAMPLE_NAME_2, ..., SAMPLE_NAME_N
    if (!sample) {
        const prefix = `${placeholder.sampleName}_`;
        const parts: string[] = [];

        for (const [name, code] of fileSamples.entries()) {
            if (name.startsWith(prefix)) {
                parts.push(code);
            }
        }

        if (parts.length === 0) {
            throw new Error(
                `Sample "${placeholder.sampleName}" not found in "${placeholder.filePath}" (resolved to ${filePath})`,
            );
        }
        sample = parts.join('\n\n');
    }
    const formatted = await formatSampleCode(sample);

    return ['```ts', formatted, '```'].join('\n');
}

async function processTemplateFile(templatePath: string): Promise<void> {
    const cwd = process.cwd();
    const templateContent = await fs.readFile(templatePath, 'utf8');
    const placeholders = parsePlaceholders(templateContent);

    if (placeholders.length === 0) {
        return;
    }

    const sampleCache = new Map<string, Map<string, string>>();

    // Replace placeholders
    let result = templateContent;
    for (const placeholder of placeholders) {
        const injected = await resolvePlaceholder(cwd, placeholder, sampleCache);
        result = result.replace(placeholder.raw, injected);
    }

    // template/README.md -> README.md
    const templateName = path.basename(templatePath);
    const outPath = path.resolve(cwd, templateName);
    await fs.writeFile(outPath, result, 'utf8');
    console.log(`Updated markdown: ${path.relative(cwd, outPath)} from ${path.relative(cwd, templatePath)}`);
}

async function main(): Promise<void> {
    const templates = await findTemplateFiles();
    if (templates.length === 0) {
        console.log('No template/*.md files found, nothing to update.');
        return;
    }

    for (const templatePath of templates) {
        console.log(`Processing template: ${templatePath}`);
        await processTemplateFile(templatePath);
    }
}

main().catch((error) => {
    console.error('Failed to update docs from templates:', error);
    process.exit(1);
});
