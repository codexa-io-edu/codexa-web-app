import { importCourseContent } from '../content/import';

async function main() {
  console.log('Seeding CODEXA.io Database...');
  await importCourseContent(false);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  });
