import type {Token} from './string';
import type {Template, ObjectTemplate, ArrayTemplate, MapTemplate} from './structured/types';
import {TemplateJson} from './structured/TemplateJson';

// ============================================================================
// String Pattern Templates (from README examples)
// ============================================================================

export const tokenEmail: Token = [
  'list',
  ['repeat', 3, 12, ['char', 97, 122]], // 3-12 lowercase letters
  ['pick', '.', '_', '-', ''], // Optional separator
  ['repeat', 0, 5, ['char', 97, 122]], // 0-5 more letters
  '@',
  ['pick', 'gmail.com', 'yahoo.com', 'example.org', 'test.com', 'demo.net'],
];

export const tokenPhone: Token = [
  'list',
  '+1-',
  ['char', 50, 57, 3], // Area code (2-9)
  '-',
  ['char', 48, 57, 3], // Exchange
  '-',
  ['char', 48, 57, 4], // Number
];

export const tokenProductCode: Token = [
  'list',
  ['pick', 'PRD', 'ITM', 'SKU'],
  '-',
  ['char', 65, 90, 2], // 2 uppercase letters
  ['char', 48, 57, 6], // 6 digits
];

export const tokenUrl: Token = [
  'list',
  'https://',
  ['repeat', 3, 15, ['char', 97, 122]], // Domain name
  ['pick', '.com', '.org', '.net', '.io'],
  ['pick', '', '/', '/api/', '/v1/'],
  ['repeat', 0, 10, ['char', 97, 122]], // Optional path
];

export const tokenUsername: Token = [
  'list',
  ['pick', 'user', 'admin', 'guest', 'test'],
  ['char', 48, 57, 4], // 4 digits
];

// ============================================================================
// User Profile Templates (from README examples)
// ============================================================================

export const userProfile: ObjectTemplate = [
  'obj',
  [
    ['id', ['int', 1, 10000]],
    ['username', ['str', tokenUsername]],
    ['email', ['str', tokenEmail]],
    ['age', ['int', 18, 120]],
    ['isActive', 'bool'],
    [
      'profile',
      [
        'obj',
        [
          ['bio', ['str', ['repeat', 10, 50, ['char', 32, 126]]]],
          ['avatar', ['str', ['list', 'https://avatar.example.com/', ['char', 48, 57, 8]]], 0.3], // 30% chance to omit
        ],
      ],
    ],
  ],
];

export const userBasic: ObjectTemplate = [
  'obj',
  [
    ['id', ['int', 1, 1000]],
    [
      'name',
      [
        'str',
        [
          'list',
          ['pick', 'John', 'Jane', 'Bob', 'Alice', 'Charlie'],
          ' ',
          ['pick', 'Doe', 'Smith', 'Johnson', 'Brown'],
        ],
      ],
    ],
    ['active', 'bool'],
  ],
];

// ============================================================================
// API Response Templates (from README examples)
// ============================================================================

export const apiResponse: ObjectTemplate = [
  'obj',
  [
    ['status', ['str', ['pick', 'success', 'error']]],
    ['timestamp', ['int', 1640000000, 1700000000]],
    [
      'data',
      [
        'arr',
        0,
        10,
        [
          'obj',
          [
            ['id', 'int'],
            ['value', 'str'],
          ],
        ],
      ],
    ],
  ],
];

export const apiResponseDetailed: ObjectTemplate = [
  'obj',
  [
    ['success', ['lit', true]],
    ['timestamp', ['lit', Date.now()]],
    [
      'data',
      [
        'arr',
        5,
        15,
        [
          'obj',
          [
            ['id', 'int'],
            ['status', ['str', ['pick', 'pending', 'completed', 'failed']]],
            ['value', ['float', 0, 1000]],
          ],
        ],
      ],
    ],
  ],
];

// ============================================================================
// Configuration Templates (from README examples)
// ============================================================================

export const serviceConfig: ObjectTemplate = [
  'obj',
  [
    [
      'database',
      [
        'obj',
        [
          ['host', ['str', ['list', 'db-', ['char', 48, 57, 2], '.example.com']]],
          ['port', ['int', 3000, 6000]],
          ['timeout', ['int', 1000, 30000]],
          ['pool_size', ['int', 5, 50]],
        ],
      ],
    ],
    [
      'cache',
      [
        'obj',
        [
          ['enabled', 'bool'],
          ['ttl', ['int', 60, 3600]],
          ['max_size', ['int', 100, 10000]],
        ],
      ],
    ],
    ['features', ['map', ['pick', 'feature_a', 'feature_b', 'feature_c', 'feature_d'], 'bool', 2, 5]],
  ],
];

export const configMap: MapTemplate = [
  'map',
  ['pick', 'timeout', 'retries', 'cache_ttl', 'max_connections'],
  ['int', 1, 3600],
  3,
  5,
];

export const permissions: MapTemplate = [
  'map',
  ['list', 'can_', ['pick', 'read', 'write', 'delete', 'admin']],
  'bool',
  2,
  6,
];

export const translations: MapTemplate = [
  'map',
  ['pick', 'welcome', 'goodbye', 'error', 'success', 'loading'],
  ['str', ['repeat', 5, 20, ['char', 32, 126]]],
  3,
  8,
];

// ============================================================================
// Recursive Templates (from README examples)
// ============================================================================

export const tree = (): Template => [
  'obj',
  [
    ['value', 'int'],
    ['left', tree, 0.3], // 30% chance of left child
    ['right', tree, 0.3], // 30% chance of right child
  ],
];

export const comment = (): Template => [
  'obj',
  [
    ['id', 'int'],
    ['text', 'str'],
    ['author', 'str'],
    ['replies', ['arr', 0, 3, comment, [], []], 0.4], // 40% chance of replies
  ],
];

// ============================================================================
// E-commerce Templates
// ============================================================================

export const product: ObjectTemplate = [
  'obj',
  [
    ['id', ['str', ['list', 'prod_', ['char', 48, 57, 8]]]],
    [
      'name',
      [
        'str',
        [
          'list',
          ['pick', 'Premium', 'Deluxe', 'Classic', 'Modern', 'Vintage'],
          ' ',
          ['pick', 'Widget', 'Gadget', 'Tool', 'Device', 'Accessory'],
        ],
      ],
    ],
    ['price', ['float', 9.99, 999.99]],
    ['currency', ['str', ['pick', 'USD', 'EUR', 'GBP', 'JPY']]],
    ['category', ['str', ['pick', 'electronics', 'clothing', 'books', 'home', 'sports']]],
    ['tags', ['arr', 1, 5, ['str', ['pick', 'new', 'sale', 'featured', 'popular', 'limited']]]],
    [
      'inventory',
      [
        'obj',
        [
          ['stock', ['int', 0, 1000]],
          ['warehouse', ['str', ['list', 'WH-', ['char', 65, 90, 2], ['char', 48, 57, 3]]]],
          ['reserved', ['int', 0, 50]],
        ],
      ],
    ],
    ['rating', ['float', 1.0, 5.0]],
    ['reviews', ['int', 0, 10000]],
  ],
];

export const order: ObjectTemplate = [
  'obj',
  [
    ['orderId', ['str', ['list', 'ORD-', ['char', 48, 57, 10]]]],
    ['customerId', ['str', ['list', 'CUST-', ['char', 65, 90, 3], ['char', 48, 57, 6]]]],
    [
      'items',
      [
        'arr',
        1,
        8,
        [
          'obj',
          [
            ['productId', ['str', tokenProductCode]],
            ['quantity', ['int', 1, 10]],
            ['price', ['float', 5.0, 500.0]],
          ],
        ],
      ],
    ],
    ['total', ['float', 10.0, 2000.0]],
    ['status', ['str', ['pick', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']]],
    ['createdAt', ['int', 1640000000, 1700000000]],
    [
      'shippingAddress',
      [
        'obj',
        [
          [
            'street',
            ['str', ['list', ['char', 48, 57, 3], ' ', ['pick', 'Main St', 'Oak Ave', 'Pine Rd', 'Cedar Ln']]],
          ],
          ['city', ['str', ['pick', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix']]],
          ['state', ['str', ['pick', 'NY', 'CA', 'IL', 'TX', 'AZ']]],
          ['zipCode', ['str', ['char', 48, 57, 5]]],
          ['country', ['str', ['pick', 'US', 'CA', 'MX']]],
        ],
      ],
    ],
  ],
];

// ============================================================================
// Authentication & Security Templates
// ============================================================================

export const userToken: ObjectTemplate = [
  'obj',
  [
    ['token', ['str', ['list', 'eyJ', ['repeat', 20, 40, ['char', 65, 90]]]]],
    ['refreshToken', ['str', ['list', 'rt_', ['repeat', 32, 64, ['char', 97, 122]]]]],
    ['expiresAt', ['int', Date.now(), Date.now() + 86400000]],
    ['scope', ['arr', 1, 4, ['str', ['pick', 'read', 'write', 'admin', 'user']]]],
  ],
];

export const userRole: ObjectTemplate = [
  'obj',
  [
    ['roleId', ['str', ['list', 'role_', ['char', 48, 57, 6]]]],
    ['name', ['str', ['pick', 'admin', 'user', 'moderator', 'guest', 'super_admin']]],
    [
      'permissions',
      [
        'arr',
        2,
        10,
        [
          'str',
          [
            'pick',
            'users:read',
            'users:write',
            'users:delete',
            'posts:read',
            'posts:write',
            'posts:delete',
            'admin:read',
            'admin:write',
            'system:manage',
          ],
        ],
      ],
    ],
    ['createdBy', ['str', tokenUsername]],
    ['isActive', 'bool'],
  ],
];

// ============================================================================
// Logging & Monitoring Templates
// ============================================================================

export const logEntry: ObjectTemplate = [
  'obj',
  [
    ['timestamp', ['int', Date.now() - 86400000, Date.now()]],
    ['level', ['str', ['pick', 'debug', 'info', 'warn', 'error', 'fatal']]],
    [
      'message',
      [
        'str',
        [
          'list',
          ['pick', 'User', 'System', 'Database', 'API', 'Cache'],
          ' ',
          ['pick', 'action', 'error', 'warning', 'success', 'failure'],
          ': ',
          ['repeat', 10, 50, ['char', 32, 126]],
        ],
      ],
    ],
    ['service', ['str', ['pick', 'web-server', 'database', 'cache', 'auth-service', 'api-gateway']]],
    ['userId', ['str', tokenUsername], 0.7],
    ['requestId', ['str', ['list', 'req_', ['char', 97, 122, 8], ['char', 48, 57, 4]]]],
    [
      'metadata',
      [
        'obj',
        [
          [
            'ip',
            [
              'str',
              [
                'list',
                ['char', 49, 57],
                ['char', 48, 57, 2],
                '.',
                ['char', 48, 57, 3],
                '.',
                ['char', 48, 57, 3],
                '.',
                ['char', 48, 57, 3],
              ],
            ],
          ],
          [
            'userAgent',
            [
              'str',
              [
                'pick',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                'Mozilla/5.0 (X11; Linux x86_64)',
              ],
            ],
          ],
          ['duration', ['int', 1, 5000]],
        ],
      ],
      0.5,
    ],
  ],
];

export const metricData: ObjectTemplate = [
  'obj',
  [
    ['name', ['str', ['pick', 'cpu_usage', 'memory_usage', 'disk_io', 'network_latency', 'request_count']]],
    ['value', ['float', 0, 100]],
    ['unit', ['str', ['pick', 'percent', 'bytes', 'ms', 'count', 'rate']]],
    ['timestamp', ['int', Date.now() - 3600000, Date.now()]],
    [
      'tags',
      [
        'obj',
        [
          ['environment', ['str', ['pick', 'production', 'staging', 'development']]],
          ['service', ['str', ['pick', 'web', 'api', 'database', 'cache']]],
          ['region', ['str', ['pick', 'us-east-1', 'us-west-2', 'eu-west-1']]],
        ],
      ],
    ],
  ],
];

// ============================================================================
// Geographic & Location Templates
// ============================================================================

export const coordinates: ArrayTemplate = [
  'arr',
  0,
  0,
  'nil',
  [
    ['float', -180, 180],
    ['float', -90, 90],
  ], // head: [longitude, latitude]
  [['lit', 'WGS84']], // tail: coordinate system
];

export const address: ObjectTemplate = [
  'obj',
  [
    [
      'street',
      ['str', ['list', ['char', 48, 57, 3], ' ', ['pick', 'Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Maple Dr']]],
    ],
    [
      'city',
      ['str', ['pick', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio']],
    ],
    ['state', ['str', ['pick', 'NY', 'CA', 'IL', 'TX', 'AZ', 'PA']]],
    ['country', ['str', ['pick', 'United States', 'Canada', 'Mexico', 'United Kingdom', 'Germany', 'France']]],
    ['postalCode', ['str', ['char', 48, 57, 5]]],
    ['coordinates', coordinates, 0.3],
  ],
];

export const location: ObjectTemplate = [
  'obj',
  [
    [
      'name',
      [
        'str',
        [
          'list',
          ['pick', 'Coffee Shop', 'Restaurant', 'Store', 'Office', 'Park'],
          ' ',
          ['pick', 'Downtown', 'Central', 'North', 'South', 'Main'],
        ],
      ],
    ],
    ['address', address],
    ['phone', ['str', tokenPhone]],
    [
      'hours',
      [
        'obj',
        [
          ['monday', ['str', ['pick', '9:00-17:00', '8:00-18:00', 'closed']]],
          ['tuesday', ['str', ['pick', '9:00-17:00', '8:00-18:00', 'closed']]],
          ['wednesday', ['str', ['pick', '9:00-17:00', '8:00-18:00', 'closed']]],
          ['thursday', ['str', ['pick', '9:00-17:00', '8:00-18:00', 'closed']]],
          ['friday', ['str', ['pick', '9:00-17:00', '8:00-18:00', 'closed']]],
          ['saturday', ['str', ['pick', '10:00-16:00', '9:00-15:00', 'closed']]],
          ['sunday', ['str', ['pick', '12:00-16:00', 'closed']]],
        ],
      ],
      0.4,
    ],
  ],
];

// ============================================================================
// Financial & Transaction Templates
// ============================================================================

export const transaction: ObjectTemplate = [
  'obj',
  [
    ['id', ['str', ['list', 'txn_', ['char', 97, 122, 8], ['char', 48, 57, 8]]]],
    ['amount', ['float', 0.01, 10000.0]],
    ['currency', ['str', ['pick', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']]],
    ['type', ['str', ['pick', 'debit', 'credit', 'transfer', 'payment', 'refund']]],
    ['status', ['str', ['pick', 'pending', 'completed', 'failed', 'cancelled']]],
    ['fromAccount', ['str', ['list', 'acc_', ['char', 48, 57, 12]]]],
    ['toAccount', ['str', ['list', 'acc_', ['char', 48, 57, 12]]]],
    [
      'description',
      [
        'str',
        [
          'list',
          ['pick', 'Payment to', 'Transfer from', 'Purchase at', 'Refund for'],
          ' ',
          ['repeat', 5, 20, ['char', 32, 126]],
        ],
      ],
    ],
    ['timestamp', ['int', Date.now() - 86400000, Date.now()]],
    ['fees', ['float', 0, 50.0], 0.3],
  ],
];

export const bankAccount: ObjectTemplate = [
  'obj',
  [
    ['accountNumber', ['str', ['char', 48, 57, 12]]],
    ['routingNumber', ['str', ['char', 48, 57, 9]]],
    ['accountType', ['str', ['pick', 'checking', 'savings', 'business', 'credit']]],
    ['balance', ['float', 0, 100000.0]],
    ['currency', ['str', ['pick', 'USD', 'EUR', 'GBP']]],
    ['isActive', 'bool'],
    ['openedDate', ['int', 946684800, Date.now()]], // From year 2000
    ['lastActivity', ['int', Date.now() - 2592000, Date.now()]], // Last 30 days
  ],
];

// ============================================================================
// Social Media Templates
// ============================================================================

export const socialPost: ObjectTemplate = [
  'obj',
  [
    ['id', ['str', ['list', 'post_', ['char', 97, 122, 8]]]],
    ['content', ['str', ['repeat', 10, 280, ['char', 32, 126]]]],
    [
      'author',
      [
        'obj',
        [
          ['username', ['str', tokenUsername]],
          [
            'displayName',
            [
              'str',
              [
                'list',
                ['pick', 'John', 'Jane', 'Alex', 'Sam', 'Chris'],
                ' ',
                ['pick', 'Smith', 'Doe', 'Johnson', 'Brown'],
              ],
            ],
          ],
          ['verified', 'bool'],
        ],
      ],
    ],
    ['likes', ['int', 0, 10000]],
    ['shares', ['int', 0, 1000]],
    ['comments', ['int', 0, 500]],
    ['hashtags', ['arr', 0, 5, ['str', ['list', '#', ['repeat', 3, 15, ['char', 97, 122]]]]]],
    ['mentions', ['arr', 0, 3, ['str', ['list', '@', tokenUsername]]]],
    ['timestamp', ['int', Date.now() - 604800000, Date.now()]], // Last week
    [
      'media',
      [
        'arr',
        0,
        4,
        [
          'obj',
          [
            ['type', ['str', ['pick', 'image', 'video', 'gif']]],
            ['url', ['str', tokenUrl]],
            ['alt', ['str', ['repeat', 5, 50, ['char', 32, 126]]], 0.7],
          ],
        ],
      ],
      0.4,
    ],
  ],
];

export const socialProfile: ObjectTemplate = [
  'obj',
  [
    ['username', ['str', tokenUsername]],
    ['displayName', ['str', ['repeat', 3, 30, ['char', 32, 126]]]],
    ['bio', ['str', ['repeat', 10, 160, ['char', 32, 126]]], 0.8],
    ['followers', ['int', 0, 1000000]],
    ['following', ['int', 0, 10000]],
    ['posts', ['int', 0, 50000]],
    ['verified', 'bool'],
    ['joinDate', ['int', 946684800, Date.now()]],
    ['location', ['str', ['pick', 'New York', 'London', 'Tokyo', 'Berlin', 'Sydney']], 0.6],
    ['website', ['str', tokenUrl], 0.3],
  ],
];

// ============================================================================
// IoT & Sensor Data Templates
// ============================================================================

export const sensorReading: ObjectTemplate = [
  'obj',
  [
    ['sensorId', ['str', ['list', 'sensor_', ['char', 65, 90, 2], ['char', 48, 57, 6]]]],
    ['deviceType', ['str', ['pick', 'temperature', 'humidity', 'pressure', 'motion', 'light', 'sound']]],
    ['value', ['float', -50, 150]],
    ['unit', ['str', ['pick', 'celsius', 'fahrenheit', 'percent', 'pascal', 'lux', 'decibel']]],
    ['timestamp', ['int', Date.now() - 3600000, Date.now()]],
    [
      'location',
      [
        'obj',
        [
          ['room', ['str', ['pick', 'living_room', 'bedroom', 'kitchen', 'bathroom', 'office']]],
          ['floor', ['int', 1, 10]],
          ['building', ['str', ['list', 'Building ', ['char', 65, 90]]]],
        ],
      ],
    ],
    ['status', ['str', ['pick', 'online', 'offline', 'maintenance', 'error']]],
    ['battery', ['int', 0, 100], 0.6],
  ],
];

export const iotDevice: ObjectTemplate = [
  'obj',
  [
    ['deviceId', ['str', ['list', 'iot_', ['char', 97, 122, 4], ['char', 48, 57, 8]]]],
    [
      'name',
      [
        'str',
        [
          'list',
          ['pick', 'Smart', 'Connected', 'Wireless', 'Digital'],
          ' ',
          ['pick', 'Thermostat', 'Camera', 'Lock', 'Light', 'Sensor'],
        ],
      ],
    ],
    ['manufacturer', ['str', ['pick', 'SmartHome Inc', 'IoT Solutions', 'TechDevice Co', 'ConnectCorp']]],
    ['model', ['str', ['list', ['char', 65, 90, 2], '-', ['char', 48, 57, 4]]]],
    ['firmwareVersion', ['str', ['list', ['char', 49, 57], '.', ['char', 48, 57], '.', ['char', 48, 57]]]],
    ['ipAddress', ['str', ['list', '192.168.', ['char', 48, 57, 1], '.', ['char', 48, 57, 3]]]],
    [
      'macAddress',
      [
        'str',
        [
          'list',
          ['char', 48, 57, 2],
          ':',
          ['char', 48, 57, 2],
          ':',
          ['char', 48, 57, 2],
          ':',
          ['char', 48, 57, 2],
          ':',
          ['char', 48, 57, 2],
          ':',
          ['char', 48, 57, 2],
        ],
      ],
    ],
    ['lastSeen', ['int', Date.now() - 86400000, Date.now()]],
    ['sensors', ['arr', 1, 4, sensorReading]],
  ],
];

// ============================================================================
// Medical Records Templates
// ============================================================================

export const patient: ObjectTemplate = [
  'obj',
  [
    ['patientId', ['str', ['list', 'PAT-', ['char', 48, 57, 8]]]],
    ['firstName', ['str', ['pick', 'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Lisa']]],
    ['lastName', ['str', ['pick', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']]],
    ['dateOfBirth', ['int', 157766400, 1009843200]], // 1975-2002
    ['gender', ['str', ['pick', 'male', 'female', 'non-binary', 'prefer-not-to-say']]],
    ['bloodType', ['str', ['pick', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']]],
    ['allergies', ['arr', 0, 5, ['str', ['pick', 'peanuts', 'shellfish', 'dairy', 'gluten', 'penicillin', 'latex']]]],
    [
      'emergencyContact',
      [
        'obj',
        [
          [
            'name',
            [
              'str',
              [
                'list',
                ['pick', 'John', 'Jane', 'Michael', 'Sarah'],
                ' ',
                ['pick', 'Smith', 'Johnson', 'Williams', 'Brown'],
              ],
            ],
          ],
          ['relationship', ['str', ['pick', 'spouse', 'parent', 'sibling', 'child', 'friend']]],
          ['phone', ['str', tokenPhone]],
        ],
      ],
    ],
    [
      'insurance',
      [
        'obj',
        [
          ['provider', ['str', ['pick', 'HealthCare Plus', 'MedInsure', 'WellnessCare', 'LifeHealth']]],
          ['policyNumber', ['str', ['list', ['char', 65, 90, 3], ['char', 48, 57, 9]]]],
          ['groupNumber', ['str', ['char', 48, 57, 6]]],
        ],
      ],
      0.9,
    ],
  ],
];

export const medicalRecord: ObjectTemplate = [
  'obj',
  [
    ['recordId', ['str', ['list', 'MED-', ['char', 48, 57, 10]]]],
    ['patientId', ['str', ['list', 'PAT-', ['char', 48, 57, 8]]]],
    ['visitDate', ['int', Date.now() - 31536000, Date.now()]], // Last year
    [
      'provider',
      [
        'obj',
        [
          [
            'name',
            [
              'str',
              [
                'list',
                'Dr. ',
                ['pick', 'John', 'Jane', 'Michael', 'Sarah'],
                ' ',
                ['pick', 'Smith', 'Johnson', 'Williams'],
              ],
            ],
          ],
          ['specialty', ['str', ['pick', 'cardiology', 'neurology', 'pediatrics', 'orthopedics', 'dermatology']]],
          ['license', ['str', ['list', ['char', 65, 90, 2], ['char', 48, 57, 8]]]],
        ],
      ],
    ],
    ['diagnosis', ['arr', 1, 3, ['str', ['pick', 'hypertension', 'diabetes', 'asthma', 'arthritis', 'migraine']]]],
    [
      'medications',
      [
        'arr',
        0,
        5,
        [
          'obj',
          [
            ['name', ['str', ['pick', 'Lisinopril', 'Metformin', 'Albuterol', 'Ibuprofen', 'Atorvastatin']]],
            ['dosage', ['str', ['list', ['char', 48, 57, 2], 'mg']]],
            ['frequency', ['str', ['pick', 'once daily', 'twice daily', 'three times daily', 'as needed']]],
          ],
        ],
      ],
    ],
    [
      'vitals',
      [
        'obj',
        [
          ['bloodPressure', ['str', ['list', ['char', 49, 57], ['char', 48, 57, 2], '/', ['char', 48, 57, 2]]]],
          ['heartRate', ['int', 60, 100]],
          ['temperature', ['float', 96.0, 104.0]],
          ['weight', ['float', 100, 300]],
        ],
      ],
      0.8,
    ],
  ],
];

// ============================================================================
// Educational Data Templates
// ============================================================================

export const student: ObjectTemplate = [
  'obj',
  [
    ['studentId', ['str', ['list', 'STU-', ['char', 48, 57, 7]]]],
    ['firstName', ['str', ['pick', 'Alex', 'Sam', 'Jordan', 'Casey', 'Taylor', 'Morgan', 'Riley', 'Avery']]],
    ['lastName', ['str', ['pick', 'Anderson', 'Brown', 'Clark', 'Davis', 'Evans', 'Foster', 'Green', 'Hill']]],
    ['email', ['str', tokenEmail]],
    ['grade', ['str', ['pick', '9th', '10th', '11th', '12th', 'Freshman', 'Sophomore', 'Junior', 'Senior']]],
    [
      'major',
      ['str', ['pick', 'Computer Science', 'Biology', 'Mathematics', 'English', 'History', 'Physics', 'Chemistry']],
      0.7,
    ],
    ['gpa', ['float', 2.0, 4.0]],
    ['enrollmentDate', ['int', 1567296000, Date.now()]], // From 2019
  ],
];

export const course: ObjectTemplate = [
  'obj',
  [
    ['courseId', ['str', ['list', ['char', 65, 90, 3], '-', ['char', 48, 57, 3]]]],
    [
      'title',
      [
        'str',
        [
          'list',
          ['pick', 'Introduction to', 'Advanced', 'Fundamentals of', 'Applied'],
          ' ',
          ['pick', 'Computer Science', 'Mathematics', 'Biology', 'Chemistry', 'Physics', 'History', 'Literature'],
        ],
      ],
    ],
    ['credits', ['int', 1, 6]],
    [
      'instructor',
      [
        'obj',
        [
          [
            'name',
            [
              'str',
              [
                'list',
                'Prof. ',
                ['pick', 'John', 'Jane', 'Michael', 'Sarah'],
                ' ',
                ['pick', 'Smith', 'Johnson', 'Williams'],
              ],
            ],
          ],
          ['email', ['str', tokenEmail]],
          ['office', ['str', ['list', ['char', 65, 90], '-', ['char', 48, 57, 3]]]],
        ],
      ],
    ],
    [
      'schedule',
      [
        'obj',
        [
          ['days', ['arr', 1, 3, ['str', ['pick', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']]]],
          [
            'time',
            [
              'str',
              [
                'list',
                ['char', 48, 57, 2],
                ':',
                ['pick', '00', '30'],
                '-',
                ['char', 48, 57, 2],
                ':',
                ['pick', '00', '30'],
              ],
            ],
          ],
          ['room', ['str', ['list', ['char', 65, 90], '-', ['char', 48, 57, 3]]]],
        ],
      ],
    ],
    ['capacity', ['int', 15, 200]],
    ['enrolled', ['int', 5, 180]],
  ],
];

export const grade: ObjectTemplate = [
  'obj',
  [
    ['studentId', ['str', ['list', 'STU-', ['char', 48, 57, 7]]]],
    ['courseId', ['str', ['list', ['char', 65, 90, 3], '-', ['char', 48, 57, 3]]]],
    ['semester', ['str', ['pick', 'Fall 2023', 'Spring 2024', 'Summer 2024', 'Fall 2024']]],
    [
      'assignments',
      [
        'arr',
        3,
        8,
        [
          'obj',
          [
            [
              'name',
              ['str', ['list', ['pick', 'Assignment', 'Quiz', 'Exam', 'Project', 'Lab'], ' ', ['char', 48, 57, 1]]],
            ],
            ['score', ['float', 0, 100]],
            ['maxScore', ['lit', 100]],
            ['dueDate', ['int', Date.now() - 7776000, Date.now() + 7776000]], // +/- 90 days
            ['submitted', 'bool'],
          ],
        ],
      ],
    ],
    ['finalGrade', ['str', ['pick', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F']]],
    ['gpa', ['float', 0.0, 4.0]],
  ],
];

// ============================================================================
// Edge Cases & Special Templates
// ============================================================================

export const emptyStructures: ObjectTemplate = [
  'obj',
  [
    ['emptyObject', ['obj', []]],
    ['emptyArray', ['arr', 0, 0]],
    ['emptyString', ['lit', '']],
    ['nullValue', 'nil'],
    ['zeroNumber', ['lit', 0]],
    ['falseBool', ['lit', false]],
  ],
];

export const unicodeText: ObjectTemplate = [
  'obj',
  [
    ['ascii', ['str', ['repeat', 5, 15, ['char', 32, 126]]]],
    ['latin', ['str', ['repeat', 5, 15, ['char', 160, 255]]]],
    ['emoji', ['str', ['repeat', 1, 5, ['char', 0x1f600, 0x1f64f]]]],
    ['chinese', ['str', ['repeat', 3, 8, ['char', 0x4e00, 0x9fff]]]],
    ['arabic', ['str', ['repeat', 3, 8, ['char', 0x0600, 0x06ff]]]],
    [
      'mixed',
      [
        'str',
        [
          'list',
          ['repeat', 2, 5, ['char', 65, 90]],
          ' ',
          ['char', 0x1f600, 0x1f64f],
          ' ',
          ['repeat', 2, 5, ['char', 0x4e00, 0x9fff]],
        ],
      ],
    ],
  ],
];

export const largeNumbers: ObjectTemplate = [
  'obj',
  [
    ['maxSafeInteger', ['lit', Number.MAX_SAFE_INTEGER]],
    ['minSafeInteger', ['lit', Number.MIN_SAFE_INTEGER]],
    ['largeFloat', ['float', 1e10, 1e15]],
    ['smallFloat', ['float', 1e-10, 1e-5]],
    ['preciseDecimal', ['float', 0.000001, 0.999999]],
    ['scientificNotation', ['lit', 1.23e-45]],
  ],
];

export const performanceTest: ArrayTemplate = [
  'arr',
  100,
  1000,
  [
    'obj',
    [
      ['id', ['int', 1, 1000000]],
      ['data', ['str', ['repeat', 50, 200, ['char', 32, 126]]]],
      ['nested', ['obj', [['level1', ['obj', [['level2', ['obj', [['level3', ['arr', 5, 10, 'int']]]]]]]]]]],
    ],
  ],
];

export const mixedTypes: Template = [
  'or',
  'str',
  'int',
  'float',
  'bool',
  'nil',
  ['arr', 1, 3, 'str'],
  [
    'obj',
    [
      ['key1', 'str'],
      ['key2', 'int'],
    ],
  ],
];

// ============================================================================
// Load Testing Templates (from README examples)
// ============================================================================

export const loadTestUser: ObjectTemplate = [
  'obj',
  [
    ['id', ['int', 1, 10000]],
    [
      'name',
      [
        'str',
        [
          'list',
          ['pick', 'John', 'Jane', 'Bob', 'Alice', 'Charlie'],
          ' ',
          ['pick', 'Doe', 'Smith', 'Johnson', 'Brown'],
        ],
      ],
    ],
    ['email', ['str', ['list', ['repeat', 3, 10, ['char', 97, 122]], '@test.com']]],
    ['age', ['int', 18, 65]],
    ['active', 'bool'],
  ],
];

// ============================================================================
// Combined Template using 'or' to randomly pick from all examples
// ============================================================================

export const allExamples: Template = [
  'or',
  userProfile,
  userBasic,
  apiResponse,
  apiResponseDetailed,
  serviceConfig,
  product,
  order,
  userToken,
  userRole,
  logEntry,
  metricData,
  address,
  location,
  transaction,
  bankAccount,
  socialPost,
  socialProfile,
  sensorReading,
  iotDevice,
  patient,
  medicalRecord,
  student,
  course,
  grade,
  emptyStructures,
  unicodeText,
  largeNumbers,
  performanceTest,
  mixedTypes,
  loadTestUser,
  tree,
  comment,
];

// ============================================================================
// Helper Methods for Easy Random JSON Generation
// ============================================================================

/**
 * Generate a random user profile with comprehensive details.
 * @returns Random user profile object
 */
export const genUser = () => TemplateJson.gen(userProfile);

/**
 * Generate a basic user object with essential information.
 * @returns Random basic user object
 */
export const genUserBasic = () => TemplateJson.gen(userBasic);

/**
 * Generate a random address object with street, city, state, etc.
 * @returns Random address object
 */
export const genAddress = () => TemplateJson.gen(address);

/**
 * Generate a random product with details like name, price, category.
 * @returns Random product object
 */
export const genProduct = () => TemplateJson.gen(product);

/**
 * Generate a random order with items, customer info, and totals.
 * @returns Random order object
 */
export const genOrder = () => TemplateJson.gen(order);

/**
 * Generate a random financial transaction.
 * @returns Random transaction object
 */
export const genTransaction = () => TemplateJson.gen(transaction);

/**
 * Generate a random bank account information.
 * @returns Random bank account object
 */
export const genBankAccount = () => TemplateJson.gen(bankAccount);

/**
 * Generate a random social media post.
 * @returns Random social post object
 */
export const genSocialPost = () => TemplateJson.gen(socialPost);

/**
 * Generate a random social media profile.
 * @returns Random social profile object
 */
export const genSocialProfile = () => TemplateJson.gen(socialProfile);

/**
 * Generate a random location with coordinates and details.
 * @returns Random location object
 */
export const genLocation = () => TemplateJson.gen(location);

/**
 * Generate a random API response with data array.
 * @returns Random API response object
 */
export const genApiResponse = () => TemplateJson.gen(apiResponse);

/**
 * Generate a detailed API response with comprehensive metadata.
 * @returns Random detailed API response object
 */
export const genApiResponseDetailed = () => TemplateJson.gen(apiResponseDetailed);

/**
 * Generate a random service configuration.
 * @returns Random service config object
 */
export const genServiceConfig = () => TemplateJson.gen(serviceConfig);

/**
 * Generate a random medical patient record.
 * @returns Random patient object
 */
export const genPatient = () => TemplateJson.gen(patient);

/**
 * Generate a comprehensive medical record.
 * @returns Random medical record object
 */
export const genMedicalRecord = () => TemplateJson.gen(medicalRecord);

/**
 * Generate a random student profile.
 * @returns Random student object
 */
export const genStudent = () => TemplateJson.gen(student);

/**
 * Generate a random course information.
 * @returns Random course object
 */
export const genCourse = () => TemplateJson.gen(course);

/**
 * Generate a random IoT sensor reading.
 * @returns Random sensor reading object
 */
export const genSensorReading = () => TemplateJson.gen(sensorReading);

/**
 * Generate a random IoT device profile.
 * @returns Random IoT device object
 */
export const genIotDevice = () => TemplateJson.gen(iotDevice);

/**
 * Generate a random log entry for monitoring.
 * @returns Random log entry object
 */
export const genLogEntry = () => TemplateJson.gen(logEntry);

/**
 * Generate random metric data for monitoring.
 * @returns Random metric data object
 */
export const genMetricData = () => TemplateJson.gen(metricData);

/**
 * Generate a random example from any of the available templates.
 * Uses the 'or' pattern to randomly select from all templates.
 * @returns Random example data from any template
 */
export const genRandomExample = () => TemplateJson.gen(allExamples);
