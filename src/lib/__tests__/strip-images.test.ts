import { describe, it, expect } from "vitest";
import { stripImages } from "@/lib/strip-images";

describe("stripImages", () => {
  it("removes markdown images with base64 data URIs", () => {
    const input =
      "Hello ![logo](data:image/png;base64,iVBORw0KGgoAAAANS) world";
    expect(stripImages(input)).toBe("Hello  world");
  });

  it("removes markdown images with SVG base64 data URIs", () => {
    const input =
      "Text ![icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0c) more";
    expect(stripImages(input)).toBe("Text  more");
  });

  it("removes markdown images with regular URLs", () => {
    const input = "Before ![alt](https://example.com/img.png) after";
    expect(stripImages(input)).toBe("Before  after");
  });

  it("removes multiple images", () => {
    const input =
      "A ![a](data:image/png;base64,AAA) B ![b](https://x.com/b.jpg) C";
    expect(stripImages(input)).toBe("A  B  C");
  });

  it("preserves regular markdown links", () => {
    const input = "Check [our website](https://example.com) for more";
    expect(stripImages(input)).toBe(
      "Check [our website](https://example.com) for more"
    );
  });

  it("handles empty alt text", () => {
    const input = "Before ![](data:image/png;base64,AAAA) after";
    expect(stripImages(input)).toBe("Before  after");
  });

  it("returns empty string for empty input", () => {
    expect(stripImages("")).toBe("");
  });

  it("returns text unchanged when no images present", () => {
    const input = "Just some regular text with no images";
    expect(stripImages(input)).toBe(input);
  });

  it("removes HTML img tags with base64 src", () => {
    const input =
      'Before <img src="data:image/png;base64,iVBOR" alt="logo"> after';
    expect(stripImages(input)).toBe("Before  after");
  });

  it("removes HTML img tags with regular src", () => {
    const input =
      'Before <img src="https://example.com/img.png" alt="photo" /> after';
    expect(stripImages(input)).toBe("Before  after");
  });

  it("removes self-closing img tags", () => {
    const input = 'Text <img src="https://x.com/a.png"/> more';
    expect(stripImages(input)).toBe("Text  more");
  });
});
