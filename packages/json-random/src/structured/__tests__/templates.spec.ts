import {deterministic} from '../../util';
import {TemplateJson} from '../TemplateJson';
import * as templates from '../../examples';

describe('Template Examples', () => {
  describe('String Pattern Templates', () => {
    test('generates email addresses', () => {
      deterministic(123, () => {
        const email = TemplateJson.gen(['str', templates.tokenEmail]) as string;
        expect(typeof email).toBe('string');
        expect(email).toContain('@');
        expect(email.length).toBeGreaterThan(5);
      });
    });

    test('generates phone numbers', () => {
      deterministic(456, () => {
        const phone = TemplateJson.gen(['str', templates.tokenPhone]) as string;
        expect(typeof phone).toBe('string');
        expect(phone).toMatch(/^\+1-\d{3}-\d{3}-\d{4}$/);
      });
    });

    test('generates product codes', () => {
      deterministic(789, () => {
        const code = TemplateJson.gen(['str', templates.tokenProductCode]) as string;
        expect(typeof code).toBe('string');
        expect(code).toMatch(/^(PRD|ITM|SKU)-[A-Z]{2}\d{6}$/);
      });
    });

    test('generates URLs', () => {
      deterministic(101, () => {
        const url = TemplateJson.gen(['str', templates.tokenUrl]) as string;
        expect(typeof url).toBe('string');
        expect(url).toMatch(/^https:\/\/.*\.(com|org|net|io)/);
      });
    });
  });

  describe('User Profile Templates', () => {
    test('generates user profile with all required fields', () => {
      deterministic(202, () => {
        const user = TemplateJson.gen(templates.userProfile) as any;
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('age');
        expect(user).toHaveProperty('isActive');
        expect(user).toHaveProperty('profile');
        expect(typeof user.id).toBe('number');
        expect(typeof user.username).toBe('string');
        expect(typeof user.email).toBe('string');
        expect(typeof user.age).toBe('number');
        expect(typeof user.isActive).toBe('boolean');
        expect(user.age).toBeGreaterThanOrEqual(18);
        expect(user.age).toBeLessThanOrEqual(120);
      });
    });

    test('generates basic user with required fields', () => {
      deterministic(303, () => {
        const user = TemplateJson.gen(templates.userBasic) as any;
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('active');
        expect(typeof user.id).toBe('number');
        expect(typeof user.name).toBe('string');
        expect(typeof user.active).toBe('boolean');
        expect(user.name).toContain(' '); // Should have first and last name
      });
    });
  });

  describe('API Response Templates', () => {
    test('generates API response with correct structure', () => {
      deterministic(404, () => {
        const response = TemplateJson.gen(templates.apiResponse) as any;
        expect(response).toHaveProperty('status');
        expect(response).toHaveProperty('timestamp');
        expect(response).toHaveProperty('data');
        expect(['success', 'error']).toContain(response.status);
        expect(typeof response.timestamp).toBe('number');
        expect(Array.isArray(response.data)).toBe(true);
      });
    });
  });

  describe('E-commerce Templates', () => {
    test('generates product with all fields', () => {
      deterministic(505, () => {
        const product = TemplateJson.gen(templates.product) as any;
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('currency');
        expect(product).toHaveProperty('category');
        expect(product).toHaveProperty('tags');
        expect(product).toHaveProperty('inventory');
        expect(product).toHaveProperty('rating');
        expect(product).toHaveProperty('reviews');

        expect(typeof product.id).toBe('string');
        expect(product.id).toMatch(/^prod_\d{8}$/);
        expect(typeof product.price).toBe('number');
        expect(product.price).toBeGreaterThanOrEqual(9.99);
        expect(Array.isArray(product.tags)).toBe(true);
        expect(product.inventory).toHaveProperty('stock');
        expect(product.rating).toBeGreaterThanOrEqual(1.0);
        expect(product.rating).toBeLessThanOrEqual(5.0);
      });
    });

    test('generates order with items', () => {
      deterministic(606, () => {
        const order = TemplateJson.gen(templates.order) as any;
        expect(order).toHaveProperty('orderId');
        expect(order).toHaveProperty('customerId');
        expect(order).toHaveProperty('items');
        expect(order).toHaveProperty('total');
        expect(order).toHaveProperty('status');
        expect(order).toHaveProperty('shippingAddress');

        expect(order.orderId).toMatch(/^ORD-\d{10}$/);
        expect(order.customerId).toMatch(/^CUST-[A-Z]{3}\d{6}$/);
        expect(Array.isArray(order.items)).toBe(true);
        expect(order.items.length).toBeGreaterThan(0);
        expect(order.shippingAddress).toHaveProperty('street');
        expect(order.shippingAddress).toHaveProperty('city');
        expect(order.shippingAddress).toHaveProperty('state');
        expect(order.shippingAddress).toHaveProperty('zipCode');
      });
    });
  });

  describe('Recursive Templates', () => {
    test('generates tree structure', () => {
      deterministic(707, () => {
        const tree = TemplateJson.gen(templates.tree()) as any;
        expect(tree).toHaveProperty('value');
        expect(typeof tree.value).toBe('number');
        // Tree may or may not have left/right children due to probability
      });
    });

    test('generates comment thread', () => {
      deterministic(808, () => {
        const comment = TemplateJson.gen(templates.comment()) as any;
        expect(comment).toHaveProperty('id');
        expect(comment).toHaveProperty('text');
        expect(comment).toHaveProperty('author');
        expect(typeof comment.id).toBe('number');
        expect(typeof comment.text).toBe('string');
        expect(typeof comment.author).toBe('string');
        // Replies may or may not exist due to probability
      });
    });
  });

  describe('IoT & Sensor Templates', () => {
    test('generates sensor reading', () => {
      deterministic(909, () => {
        const reading = TemplateJson.gen(templates.sensorReading) as any;
        expect(reading).toHaveProperty('sensorId');
        expect(reading).toHaveProperty('deviceType');
        expect(reading).toHaveProperty('value');
        expect(reading).toHaveProperty('unit');
        expect(reading).toHaveProperty('timestamp');
        expect(reading).toHaveProperty('location');
        expect(reading).toHaveProperty('status');

        expect(reading.sensorId).toMatch(/^sensor_[A-Z]{2}\d{6}$/);
        expect(typeof reading.value).toBe('number');
        expect(reading.value).toBeGreaterThanOrEqual(-50);
        expect(reading.value).toBeLessThanOrEqual(150);
        expect(reading.location).toHaveProperty('room');
        expect(reading.location).toHaveProperty('floor');
      });
    });
  });

  describe('Medical Templates', () => {
    test('generates patient record', () => {
      deterministic(1010, () => {
        const patient = TemplateJson.gen(templates.patient) as any;
        expect(patient).toHaveProperty('patientId');
        expect(patient).toHaveProperty('firstName');
        expect(patient).toHaveProperty('lastName');
        expect(patient).toHaveProperty('dateOfBirth');
        expect(patient).toHaveProperty('gender');
        expect(patient).toHaveProperty('bloodType');
        expect(patient).toHaveProperty('allergies');
        expect(patient).toHaveProperty('emergencyContact');

        expect(patient.patientId).toMatch(/^PAT-\d{8}$/);
        expect(typeof patient.firstName).toBe('string');
        expect(typeof patient.lastName).toBe('string');
        expect(Array.isArray(patient.allergies)).toBe(true);
        expect(patient.emergencyContact).toHaveProperty('name');
        expect(patient.emergencyContact).toHaveProperty('relationship');
        expect(patient.emergencyContact).toHaveProperty('phone');
      });
    });
  });

  describe('Edge Case Templates', () => {
    test('generates empty structures', () => {
      const empty = TemplateJson.gen(templates.emptyStructures) as any;
      expect(empty).toHaveProperty('emptyObject');
      expect(empty).toHaveProperty('emptyArray');
      expect(empty).toHaveProperty('emptyString');
      expect(empty).toHaveProperty('nullValue');
      expect(empty).toHaveProperty('zeroNumber');
      expect(empty).toHaveProperty('falseBool');

      expect(empty.emptyObject).toEqual({});
      expect(empty.emptyArray).toEqual([]);
      expect(empty.emptyString).toBe('');
      expect(empty.nullValue).toBeNull();
      expect(empty.zeroNumber).toBe(0);
      expect(empty.falseBool).toBe(false);
    });

    test('generates unicode text', () => {
      deterministic(1111, () => {
        const unicode = TemplateJson.gen(templates.unicodeText) as any;
        expect(unicode).toHaveProperty('ascii');
        expect(unicode).toHaveProperty('latin');
        expect(unicode).toHaveProperty('emoji');
        expect(unicode).toHaveProperty('chinese');
        expect(unicode).toHaveProperty('arabic');
        expect(unicode).toHaveProperty('mixed');

        expect(typeof unicode.ascii).toBe('string');
        expect(typeof unicode.emoji).toBe('string');
        expect(typeof unicode.mixed).toBe('string');
      });
    });

    test('generates large numbers', () => {
      const large = TemplateJson.gen(templates.largeNumbers) as any;
      expect(large).toHaveProperty('maxSafeInteger');
      expect(large).toHaveProperty('minSafeInteger');
      expect(large).toHaveProperty('largeFloat');
      expect(large).toHaveProperty('smallFloat');
      expect(large).toHaveProperty('preciseDecimal');
      expect(large).toHaveProperty('scientificNotation');

      expect(large.maxSafeInteger).toBe(Number.MAX_SAFE_INTEGER);
      expect(large.minSafeInteger).toBe(Number.MIN_SAFE_INTEGER);
      expect(typeof large.largeFloat).toBe('number');
      expect(typeof large.smallFloat).toBe('number');
      expect(large.scientificNotation).toBe(1.23e-45);
    });

    test('generates mixed types with or template', () => {
      deterministic(1212, () => {
        // Test multiple times to see different types
        const values = [];
        for (let i = 0; i < 10; i++) {
          values.push(TemplateJson.gen(templates.mixedTypes));
        }

        // Should have generated different types
        const types = new Set(values.map((v) => typeof v));
        expect(types.size).toBeGreaterThan(1);
      });
    });
  });

  describe('Combined Template', () => {
    test('generates data from allExamples template using or', () => {
      deterministic(9999, () => {
        // Test multiple times to ensure it can generate different types
        const results = [];
        for (let i = 0; i < 20; i++) {
          const result = TemplateJson.gen(templates.allExamples);
          results.push(result);
          expect(result).toBeDefined();
          expect(typeof result).toBe('object');
        }

        // Should have generated some variety (not all identical)
        const stringified = results.map((r) => JSON.stringify(r));
        const unique = new Set(stringified);
        expect(unique.size).toBeGreaterThan(1);
      });
    });
  });
});
