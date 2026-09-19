// LocalStorage Mock Database helper for Atelier

export const getDB = (key, defaultData) => {
  if (typeof window === 'undefined') return defaultData;
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("DB Parse error for key", key, e);
    }
  }
  // Initialize if not present
  localStorage.setItem(key, JSON.stringify(defaultData));
  return defaultData;
};

export const saveDB = (key, data) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

// Default Database mock templates
export const defaultStudents = [
  { id: 1, name: 'Aditya Rao', email: 'aditya.rao@atelier.academy', phone: '+91 7411288457', college: 'KVG College of Engineering', gradYear: '2027', enrolledCourses: [1, 2], xp: 450, streak: 7 }
];

export const defaultCourses = [
  {
    id: 1,
    title: 'Full-Stack AI & SaaS Cohort: Web Engineering + System Design + GenAI',
    description: 'Build real scalable products used by thousands of users, learn AI engineering, full stack development, DevOps, system design, and prepare for tech careers.',
    image: '/images/course_mentor_30.png',
    badges: ['Real Product', 'Certified', '24/7 Support'],
    price: 'Rs. 6999',
    originalPrice: 'Rs. 14891',
    discount: '53% OFF',
    instructorId: 1
  },
  {
    id: 2,
    title: 'System Design & Architectural Masterclass',
    description: 'Learn high-level system scaling, database replication, routing load balances, caching strategies, and CDN networks.',
    image: '/images/course_data_science.png',
    badges: ['System Design', 'Scaling', 'Live Labs'],
    price: 'Rs. 5999',
    originalPrice: 'Rs. 11998',
    discount: '50% OFF',
    instructorId: 1
  },
  {
    id: 3,
    title: 'Applied AI & Autonomous Agents Engineering',
    description: 'Hands-on training building production AI agents, tool-augmented LLM pipelines, vector databases, and real-time intelligent SaaS workflows.',
    image: '/images/course_cohort_2.png',
    badges: ['Gen AI', 'Certified', '24/7 Support'],
    price: 'Rs. 4999',
    originalPrice: 'Rs. 9998',
    discount: '50% OFF',
    instructorId: 2
  }
];

export const defaultSchedule = [
  { id: 1, courseId: 1, time: 'Today, 6:00 PM', title: 'WebSockets & Live Duplex Connections', type: 'Lecture' },
  { id: 2, courseId: 1, time: 'Tomorrow, 7:00 PM', title: 'Data Structures: Trie & Segment Tree Algorithms', type: 'Lecture' },
  { id: 3, courseId: 1, time: 'June 24, 6:00 PM', title: 'Dockerizing & Provisioning Multi-Container Systems', type: 'Lab' },
  { id: 4, courseId: 1, time: 'June 26, 4:00 PM', title: 'Mentorship review & Mock Practice Interview', type: 'Review' },
  { id: 5, courseId: 2, time: 'Today, 8:00 PM', title: 'Caching Topologies & Redis Cluster Setup', type: 'Lecture' },
  { id: 6, courseId: 2, time: 'Tomorrow, 7:00 PM', title: 'Kafka Partitioning & Log Compaction', type: 'Lecture' },
  { id: 7, courseId: 2, time: 'June 25, 6:00 PM', title: 'Designing Rate Limiters for Scale', type: 'Lab' },
  { id: 8, courseId: 2, time: 'June 27, 4:00 PM', title: 'Disaster Recovery & Active-Active Deployments', type: 'Review' }
];

export const defaultRecordings = [
  { id: 1, courseId: 1, title: 'Week 4 - NextJS App Router & Client States', date: 'June 18, 2026', image: '/images/course_cohort_2.png' },
  { id: 2, courseId: 1, title: 'Week 3 - SQL joins, Indexes, and Query Plans', date: 'June 14, 2026', image: '/images/course_data_science.png' },
  { id: 3, courseId: 1, title: 'Week 3 - Relational Database Management', date: 'June 11, 2026', image: '/images/course_mentor_30.png' },
  { id: 4, courseId: 2, title: 'Week 2 - Consistent Hashing & Ring Ring Routing', date: 'June 17, 2026', image: '/images/course_cohort_2.png' },
  { id: 5, courseId: 2, title: 'Week 1 - SQL Replication & Write-Ahead Logs', date: 'June 12, 2026', image: '/images/course_data_science.png' },
  { id: 6, courseId: 2, title: 'Week 1 - DNS, CDNs & Static Asset Caching', date: 'June 09, 2026', image: '/images/course_mentor_30.png' }
];

export const defaultMaterials = [
  {
    id: 1,
    courseId: 1,
    title: 'Module 1 - HTML, CSS & Layouts',
    assets: [
      { name: 'Syllabus & Milestones Checklist.pdf', size: '1.2 MB', type: 'pdf' },
      { name: 'Grid & Flexbox cheat sheet.pdf', size: '840 KB', type: 'pdf' },
      { name: 'Atelier Workbench layout template.zip', size: '4.8 MB', type: 'zip' }
    ]
  },
  {
    id: 2,
    courseId: 1,
    title: 'Module 2 - Advanced DOM & JavaScript',
    assets: [
      { name: 'Async JS & Callbacks lecture notes.pdf', size: '2.1 MB', type: 'pdf' },
      { name: 'Event Loop & Execution context slides.key', size: '12.4 MB', type: 'key' },
      { name: 'Cohort Practice Repo link', size: 'External', type: 'link' }
    ]
  },
  {
    id: 3,
    courseId: 1,
    title: 'Module 3 - Node, Express, & WebSockets',
    assets: [
      { name: 'WebSocket handshake sequence guide.pdf', size: '950 KB', type: 'pdf' },
      { name: 'Express API Server code structure.zip', size: '3.1 MB', type: 'zip' },
      { name: 'Production Deployment instructions.md', size: '18 KB', type: 'md' }
    ]
  },
  {
    id: 4,
    courseId: 2,
    title: 'Module 1 - Load Balancers & CDNs',
    assets: [
      { name: 'Nginx upstream configuration.conf', size: '4 KB', type: 'md' },
      { name: 'CDN Cache Invalidation best practices.pdf', size: '1.8 MB', type: 'pdf' },
      { name: 'Round-Robin load test scripts.zip', size: '2.4 MB', type: 'zip' }
    ]
  },
  {
    id: 5,
    courseId: 2,
    title: 'Module 2 - Database Sharding & Partitioning',
    assets: [
      { name: 'Consistent Hashing ring simulator.zip', size: '3.1 MB', type: 'zip' },
      { name: 'Horizontal sharding keys strategy.pdf', size: '1.9 MB', type: 'pdf' },
      { name: 'Postgres partitioned query plans.sql', size: '12 KB', type: 'link' }
    ]
  },
  {
    id: 6,
    courseId: 2,
    title: 'Module 3 - Redis Caching Topologies',
    assets: [
      { name: 'Eviction policies benchmark.pdf', size: '2.7 MB', type: 'pdf' },
      { name: 'Redis cluster configuration.conf', size: '8 KB', type: 'md' },
      { name: 'Atelier Cache-aside implementation.zip', size: '1.2 MB', type: 'zip' }
    ]
  }
];

export const defaultCallbacks = [
  { id: 1, studentName: 'Aditya Rao', phone: '+91 7411288457', topic: 'JavaScript DOM event issue', time: '2026-06-21T17:15:00Z', status: 'Pending' }
];

export const defaultLecturers = [
  { id: 1, name: 'Arshad Muhammad', email: 'arshad@atelier.academy', expertise: 'Full Stack & Distributed Systems', bio: 'Technical Lead at Sphere Hive and systems engineer building production SaaS platforms.' },
  { id: 2, name: 'Mohammed Suhail', email: 'suhail@atelier.academy', expertise: 'Cloud Infrastructure & DevOps', bio: 'DevOps & cloud infrastructure architect with expertise in multi-region deployments.' }
];

export const defaultTransactions = [
  { id: 1, studentId: 1, studentName: 'Aditya Rao', courseId: 1, courseTitle: 'Full-Stack AI & SaaS Cohort: Web Engineering + System Design + GenAI', amount: 'Rs. 6999', timestamp: '2026-06-21T10:30:00Z', status: 'Success' },
  { id: 2, studentId: 1, studentName: 'Aditya Rao', courseId: 2, courseTitle: 'System Design & Architectural Masterclass', amount: 'Rs. 5999', timestamp: '2026-06-21T11:45:00Z', status: 'Success' }
];
