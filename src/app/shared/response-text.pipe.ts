import { Pipe, PipeTransform } from '@angular/core';

type ResponseBlock =
  | { type: 'paragraph'; content: string }
  | { type: 'unordered-list'; items: string[] }
  | { type: 'ordered-list'; items: string[] };

@Pipe({
  name: 'responseText',
  standalone: true,
})
export class ResponseTextPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    const blocks = parseResponseBlocks(value ?? '');
    return blocks
      .map(block => {
        if (block.type === 'paragraph') {
          return `<p>${escapeHtml(block.content)}</p>`;
        }

        const tag = block.type === 'ordered-list' ? 'ol' : 'ul';
        const items = block.items
          .map(item => `<li>${escapeHtml(item)}</li>`)
          .join('');

        return `<${tag}>${items}</${tag}>`;
      })
      .join('');
  }
}

function parseResponseBlocks(value: string): ResponseBlock[] {
  const lines = value
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trim());

  const blocks: ResponseBlock[] = [];
  let paragraphLines: string[] = [];
  let listType: 'unordered-list' | 'ordered-list' | null = null;
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (!paragraphLines.length) {
      return;
    }

    blocks.push({
      type: 'paragraph',
      content: paragraphLines.join(' '),
    });
    paragraphLines = [];
  };

  const flushList = () => {
    if (!listType || !listItems.length) {
      listType = null;
      listItems = [];
      return;
    }

    blocks.push({
      type: listType,
      items: [...listItems],
    });
    listType = null;
    listItems = [];
  };

  for (const line of lines) {
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const unorderedMatch = line.match(/^[-*•]\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (listType && listType !== 'unordered-list') {
        flushList();
      }
      listType = 'unordered-list';
      listItems.push(unorderedMatch[1].trim());
      continue;
    }

    const orderedMatch = line.match(/^\d+[.)]\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      if (listType && listType !== 'ordered-list') {
        flushList();
      }
      listType = 'ordered-list';
      listItems.push(orderedMatch[1].trim());
      continue;
    }

    if (listType) {
      flushList();
    }

    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
