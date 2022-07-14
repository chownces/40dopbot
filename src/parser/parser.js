const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const englishParser = async (text) => {
  const dom = await new JSDOM(text);

  const mainContent = dom.window.document
    .querySelector(".et_pb_row_2")
    .querySelector(".et_pb_text_inner");
  const prayerSection = dom.window.document
    .querySelector(".et_pb_row_4")
    .querySelector(".et_pb_text_inner");

  const date = dom.window.document
    .querySelector(".et_pb_row_1")
    .querySelector(".et_pb_text_inner").textContent;
  const title = mainContent.children[0].textContent;

  // Remove title node
  let verse = Array.from(mainContent.children);
  verse.shift();
  verse.forEach((e) => recursiveSuperscript(e));

  // temporarily stores the alternating verse ref and verse contents
  let temp = [];

  // only get the verses amongst all the content for the day
  for (const i of verse) {
    // Those nodes without verse tags dont have children
    if (i.children[0] && i.children[0].tagName === "VERSE") {
      if (i.textContent.includes("|")) {
        const s = i.textContent.split("|");
        s.forEach((e) => temp.push(e.trim()));
      }
    }
  }
  verse = temp;

  let verseRef = "";
  let verseContent = "";

  if (verse[0].toLowerCase() === "scripture") {
    // Handle case where no scripture texts are provided
    // e.g. SCRIPTURE | PHILIPPIANS 2:5-8
    verseRef = verse[1];
  } else {
    // Handle multiple scripture references
    for (let i = 0; i < verse.length; i++) {
      if (i % 2 === 0) {
        verseRef += verse[i].trim().concat(", ");
        // Add the starting verse number of each reference
        verseContent +=
          // Handles 8:1, 4-6 and 8:1-2, 4-6
          (verse[i].match(/:([0-9]+)(-[0-9]+)?,\W?([0-9]+)-/)
            ? toSuperscript(verse[i].match(/:([0-9]+),\W?([0-9]+)-/)[1])
            : // Normal 8:1-4
            verse[i].match(/:([0-9]+)-/)
            ? toSuperscript(verse[i].match(/:(.*)-/)[1])
            : // Handles 'longer' dash which occurs when dashing with whitespaces, 8:1 – 4
            verse[i].match(/:(.*)–/)
            ? toSuperscript(verse[i].match(/:(.*)–/)[1].trim())
            : // Else it's just a single verse
              toSuperscript(verse[i].match(/:(.*)/)[1])) + " ";
      } else {
        verseContent += verse[i].trimStart();
      }
    }

    verseRef = verseRef.substring(0, verseRef.length - 2);
    verseContent = verseContent.replace(
      /[¹²³⁴⁵⁶⁷⁸⁹⁰]+/g,
      (match) => "\n" + match
    );
  }

  // Get all nodes after the starting verse
  let reflectionContent = Array.from(mainContent.children);
  reflectionContent.shift(); // remove title node
  reflectionContent.shift(); // remove scripture node

  const reflection =
    "📝 " +
    markdownBold("Reflection") +
    reflectionContent.reduce((acc, elem) => {
      if (elem.tagName === "P") {
        return acc + "\n\n" + recursiveItaliciseRefsAndEm(elem);
      }
    }, "");

  const prayerContent = Array.from(prayerSection.children);
  const prayer =
    "\n🙏🏻 " +
    prayerContent.reduce((acc, elem) => {
      if (elem.tagName === "H2") {
        return acc + markdownBold(elem.textContent);
      }
      const formatted = recursiveItaliciseRefsAndEm(elem).trim();
      if (formatted) {
        return acc + "\n\n" + formatted;
      }
    }, "");

  const msg = `📅 40 Days of Prayer - ${markdownItalics(date + ", 2022")}

${markdownBold(title)}
${verseRef}
  
📙 ${markdownBold("Scripture")}
${verseContent}
  
${reflection}
${prayer}
`;

  return msg;
};

const chineseParser = async (text) => {
  const dom = await new JSDOM(text);

  const mainContent = dom.window.document
    .querySelector(".et_pb_row_2")
    .querySelector(".et_pb_text_inner");
  const prayerSection = dom.window.document
    .querySelector(".et_pb_row_4")
    .querySelector(".et_pb_text_inner");

  const date = dom.window.document
    .querySelector(".et_pb_row_1")
    .querySelector(".et_pb_text_inner").textContent;
  const title = mainContent.children[0].textContent;

  // Remove title node
  let verse = Array.from(mainContent.children);
  verse.shift();

  // temporarily stores the alternating verse ref and verse contents
  let temp = [];

  // only get the verses amongst all the content for the day
  for (const i of verse) {
    // Those nodes without verse tags dont have children
    if (i.children[0] && i.children[0].tagName === "VERSE") {
      if (i.textContent.includes("|")) {
        const s = i.textContent.split("|");
        s.forEach((e) => temp.push(e.trim()));
      }
    }
  }
  verse = temp;

  let verseRef = "";
  let verseContent = "";

  // Handle multiple scripture references
  for (let i = 0; i < verse.length; i++) {
    if (i % 2 === 0) {
      verseRef += verse[i].trim().concat(", ");
      // Add the starting verse number of each reference
      verseContent +=
        // Handles 8:1, 4-6 and 8:1-2, 4-6
        (verse[i].match(/:([0-9]+)(-[0-9]+)?,\W?([0-9]+)-/)
          ? toSuperscript(verse[i].match(/:([0-9]+),\W?([0-9]+)-/)[1])
          : // Normal 8:1-4
          verse[i].match(/:([0-9]+)-/)
          ? toSuperscript(verse[i].match(/:(.*)-/)[1])
          : // Handles 'longer' dash which occurs when dashing with whitespaces, 8:1 – 4
          verse[i].match(/:(.*)–/)
          ? toSuperscript(verse[i].match(/:(.*)–/)[1].trim())
          : // Else it's just a single verse
            toSuperscript(verse[i].match(/:(.*)/)[1])) + " ";
    } else {
      verseContent += verse[i].trimStart();
    }
  }

  verseRef = verseRef.substring(0, verseRef.length - 2);
  verseContent = verseContent.replace(
    /[1234567890]+(:[1234567890]+)*/g,
    (match) => {
      // Handle mid chapter change
      if (match.includes(":")) {
        match = match.split(":")[1];
      }

      return "\n" + toSuperscript(match);
    }
  );

  // Get all nodes after the starting verse
  let reflectionContent = Array.from(mainContent.children);
  reflectionContent.shift();
  reflectionContent = reflectionContent.reduce(
    (acc, elem) =>
      acc[1] || elem.children[0].tagName !== "VERSE"
        ? [[...acc[0], elem], true]
        : acc,
    [[], false]
  )[0];

  const reflection =
    "📝 " +
    "反思" +
    reflectionContent.reduce((acc, elem) => {
      if (elem.tagName === "P") {
        return acc + "\n\n" + recursiveParse(elem);
      }
    }, "");

  const prayerContent = Array.from(prayerSection.children);
  const prayer =
    "\n🙏🏻 " +
    prayerContent.reduce((acc, elem) => {
      if (elem.tagName === "H1") {
        return acc + elem.textContent.trim();
      }
      const formatted = recursiveParse(elem).trim();
      if (formatted) {
        return acc + "\n\n" + formatted;
      }
    }, "");

  const msg = `📅 40天祷告 - ${date + ", 2022"}

${title}
${verseRef}
  
📙 ${"经文"}
${verseContent}
  
${reflection}
${prayer}`;

  return msg;
};

const toSuperscript = (numberText) => {
  const map = {
    1: "¹",
    2: "²",
    3: "³",
    4: "⁴",
    5: "⁵",
    6: "⁶",
    7: "⁷",
    8: "⁸",
    9: "⁹",
    0: "⁰",
  };

  let output = "";
  for (const i of numberText) {
    output = output + map[i];
  }

  return output;
};

const markdownBold = (text) => {
  return `*${text}*`;
};

const markdownItalics = (text) => {
  return `_${text}_`;
};

const recursiveItaliciseRefsAndEm = (domObj) => {
  if (Array.from(domObj.childNodes).length <= 1) {
    // Escape Markdown characters within text
    const text = domObj.textContent
      .replace("_", "\\_")
      .replace("*", "\\*")
      .replace("`", "\\`");

    return domObj.tagName === "REF" || domObj.tagName === "EM"
      ? markdownItalics(text)
      : domObj.tagName === "EBULLET"
      ? text.replace("■", "-").replace("•", "  •")
      : text;
  } else {
    return Array.from(domObj.childNodes).reduce(
      (acc, elem) => acc + recursiveItaliciseRefsAndEm(elem),
      ""
    );
  }
};

const recursiveParse = (domObj) => {
  if (Array.from(domObj.childNodes).length <= 1) {
    // Escape Markdown characters within text
    const text = domObj.textContent
      .replace("_", "\\_")
      .replace("*", "\\*")
      .replace("`", "\\`");

    return domObj.tagName === "EBULLET"
      ? text.replace("■", "-").replace("•", "  •")
      : text;
  } else {
    return Array.from(domObj.childNodes).reduce(
      (acc, elem) => acc + recursiveParse(elem),
      ""
    );
  }
};

const recursiveSuperscript = (domObj) => {
  if (domObj.tagName === "SUP") {
    const text = domObj.textContent;
    domObj.textContent = toSuperscript(text);
  }
  if (Array.from(domObj.childNodes).length > 0) {
    Array.from(domObj.childNodes).forEach((e) => recursiveSuperscript(e));
  }
};

module.exports = { englishParser, chineseParser };
