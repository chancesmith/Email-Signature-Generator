import {
  checkRequiredFields,
  filterFilesForZip,
  getFileName,
  getFullNameFileName,
} from "./main";
import { Contact } from "./types";

const contactGenerator: () => Contact = () => ({
  "Full Name*": "nothing",
  Credentials: "nothing",
  "Title*": "nothing",
  "Office Phone*": "nothing",
  "Mobile Phone": "nothing",
  "Calendly Link": "nothing",
  "Brand*": "ata-capital",
});

// test getFullNameFileName
describe("getFullNameFileName", () => {
  it("should return the correct file name", () => {
    const contact: Contact = {
      ...contactGenerator(),
      "Full Name*": "John Doe",
    };
    const result = getFullNameFileName(contact);
    expect(result.fullNameFileName).toBe("john_doe");
  });

  it("should return file name with a middle name", () => {
    const contact: Contact = {
      ...contactGenerator(),
      "Full Name*": "John Michael Doe",
    };
    const result = getFullNameFileName(contact);
    expect(result.fullNameFileName).toBe("john_michael_doe");
  });
});

// test getFileName
describe("getFileName", () => {
  it("should return the correct file name", () => {
    const contact: Contact = {
      ...contactGenerator(),
      "Full Name*": "John Doe",
    };
    const result = getFileName(contact);
    expect(result).toBe("jdoe");
  });

  it("should return file name with a middle name", () => {
    const contact: Contact = {
      ...contactGenerator(),
      "Full Name*": "John Michael Doe",
    };
    const result = getFileName(contact);
    expect(result).toBe("jmichaeldoe");
  });
});

describe("filterFilesForZip", () => {
  const files = [
    ".gitkeep",
    "acurl.htm",
    "anitti.htm",
    "ndodge.htm",
    "_statusReport.txt",
  ];

  const result = files.filter(filterFilesForZip);

  expect(result).toStrictEqual([
    "acurl.htm",
    "anitti.htm",
    "ndodge.htm",
    "_statusReport.txt",
  ]);
});

describe("checkRequiredFields", () => {
  it('should return "true" if all required fields are present', () => {
    const result = checkRequiredFields(contactGenerator());

    expect(result).toBe(true);
  });

  it('should return "false" if any required fields are missing', () => {
    expect(
      checkRequiredFields({
        ...contactGenerator(),
        // @ts-ignore - we're assuming Contact had missing data in runtime
        "Brand*": undefined,
      })
    ).toBe(false);

    expect(
      checkRequiredFields({
        ...contactGenerator(),
        // @ts-ignore - we're assuming Contact had missing data in runtime
        "Full Name*": undefined,
      })
    ).toBe(false);

    expect(
      checkRequiredFields({
        ...contactGenerator(),
        // @ts-ignore - we're assuming Contact had missing data in runtime
        "Office Phone*": undefined,
      })
    ).toBe(false);

    expect(
      checkRequiredFields({
        ...contactGenerator(),
        // @ts-ignore - we're assuming Contact had missing data in runtime
        "Title*": undefined,
      })
    ).toBe(false);
  });
});
