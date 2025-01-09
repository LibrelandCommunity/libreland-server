import fs from 'node:fs/promises';
import path from 'node:path';


const IMAGES_DIR = '../archiver/images/';

const baseUrl = 'https://steamuserimages-a.akamaihd.net/ugc/';
const handleImage = async (image: string) => {
  if (image.startsWith("http")) {
    console.log("skipping non-ugc image", image)
    return;
  };

  // For partial URLs
  const parts = image.split('/');
  let filename = (parts.length > 1) ? parts[0] + '_' + parts[1] : parts[0];
  if (!filename.endsWith('.png')) {
    filename += '.png';
  }

  const file = Bun.file(path.join(IMAGES_DIR, filename));
  if (await file.exists()) {
    console.log("file exists for", image, "skipping")
    return;
  }

  console.log("downloading file", image)
  const res = await fetch(baseUrl + image);
  await Bun.write(file, res);
}


const findImProperties = async (obj: any) => {
  // Recursive function to find 'im' properties in an object
  if (obj !== null && typeof obj === 'object') {
    for (const key in obj) {
      if (key === 'im') {
        await handleImage(obj[key])
      }
      else if (typeof obj[key] === 'object') {
        findImProperties(obj[key]);
      }
    }
  }
}



const DIR = "./data/thing/def/";
const files = await fs.readdir(DIR);

for (let i = 0; i <= files.length; i++) {
  const filename = files[i];
  //console.log(i, "/", files.length, filename);

  try {
    const file = Bun.file(path.join(DIR, filename));
    const content = await file.json();

    if (content.p) {
      await findImProperties(content.p)
    }
  } catch(e) {
    console.log("error processing file", filename, e)
  }
}
