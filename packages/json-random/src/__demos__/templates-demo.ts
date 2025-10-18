import {TemplateJson} from '../structured/TemplateJson';
import * as templates from '../examples';

console.log('🎲 JSON Random Template Examples\n');

console.log('📧 Email addresses:');
for (let i = 0; i < 3; i++) {
  const email = TemplateJson.gen(['str', templates.tokenEmail]);
  console.log(`  ${email}`);
}

console.log('\n📞 Phone numbers:');
for (let i = 0; i < 3; i++) {
  const phone = TemplateJson.gen(['str', templates.tokenPhone]);
  console.log(`  ${phone}`);
}

console.log('\n🏷️ Product codes:');
for (let i = 0; i < 3; i++) {
  const code = TemplateJson.gen(['str', templates.tokenProductCode]);
  console.log(`  ${code}`);
}

console.log('\n👤 User profile:');
const user = TemplateJson.gen(templates.userProfile);
console.log(JSON.stringify(user, null, 2));

console.log('\n🛒 E-commerce product:');
const product = TemplateJson.gen(templates.product);
console.log(JSON.stringify(product, null, 2));

console.log('\n📋 Order:');
const order = TemplateJson.gen(templates.order);
console.log(JSON.stringify(order, null, 2));

console.log('\n🌐 API Response:');
const apiResponse = TemplateJson.gen(templates.apiResponse);
console.log(JSON.stringify(apiResponse, null, 2));

console.log('\n🏥 Patient record:');
const patient = TemplateJson.gen(templates.patient);
console.log(JSON.stringify(patient, null, 2));

console.log('\n📊 IoT Sensor reading:');
const sensor = TemplateJson.gen(templates.sensorReading);
console.log(JSON.stringify(sensor, null, 2));

console.log('\n🌳 Tree structure (recursive):');
const tree = TemplateJson.gen(templates.tree());
console.log(JSON.stringify(tree, null, 2));

console.log('\n🔀 Mixed types (or template):');
for (let i = 0; i < 5; i++) {
  const mixed = TemplateJson.gen(templates.mixedTypes);
  console.log(`  ${typeof mixed}: ${JSON.stringify(mixed)}`);
}

console.log('\n🎯 Edge cases:');
const empty = TemplateJson.gen(templates.emptyStructures);
console.log(JSON.stringify(empty, null, 2));

console.log('\n📏 Large numbers:');
const large = TemplateJson.gen(templates.largeNumbers);
console.log(JSON.stringify(large, null, 2));

console.log('\n🎰 Random examples from allExamples template:');
for (let i = 0; i < 3; i++) {
  const example = TemplateJson.gen(templates.allExamples);
  console.log(`Example ${i + 1}:`, JSON.stringify(example, null, 2));
  console.log('---');
}
