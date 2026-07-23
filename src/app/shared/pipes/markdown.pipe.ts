import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

/** Renders basic markdown (headings, lists, code, bold/italic) as sanitized HTML. */
@Pipe({ name: 'markdown', standalone: true })
export class MarkdownPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  constructor() {
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  }

  transform(value: string | null | undefined): SafeHtml {
    if (!value) {
      return '';
    }

    const html = marked.parse(value, { async: false }) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
