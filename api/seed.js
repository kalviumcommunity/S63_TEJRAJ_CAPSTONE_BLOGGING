import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Blog from './models/blog.model.js';
import Category from './models/category.model.js';
import User from './models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

// Sample blog content from the internet
const sampleBlogs = [
    {
        title: "The Future of Artificial Intelligence in Web Development",
        slug: "future-of-ai-in-web-development",
        content: `
            <h2>Introduction</h2>
            <p>Artificial Intelligence is revolutionizing the way we approach web development. From automated code generation to intelligent user experiences, AI is becoming an indispensable tool for modern developers.</p>
            
            <h2>AI-Powered Development Tools</h2>
            <p>Tools like GitHub Copilot, ChatGPT, and other AI assistants are transforming the coding landscape. These tools can generate entire functions, debug code, and even suggest architectural improvements.</p>
            
            <h3>Key Benefits:</h3>
            <ul>
                <li>Increased productivity and faster development cycles</li>
                <li>Reduced debugging time with AI-powered error detection</li>
                <li>Automated testing and quality assurance</li>
                <li>Intelligent code completion and suggestions</li>
            </ul>
            
            <h2>The Impact on Web Design</h2>
            <p>AI is also changing how we approach web design. Tools like Midjourney and DALL-E can generate stunning visuals, while AI algorithms can optimize user interfaces based on user behavior data.</p>
            
            <h2>Challenges and Considerations</h2>
            <p>While AI offers tremendous benefits, developers must remain vigilant about code quality, security, and the ethical implications of AI-generated content.</p>
            
            <h2>Conclusion</h2>
            <p>The future of web development is undoubtedly intertwined with AI. Embracing these technologies while maintaining human oversight will be key to success in the coming years.</p>
        `,
        featuredImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
        category: "technology"
    },
    {
        title: "Building Scalable React Applications: Best Practices",
        slug: "building-scalable-react-applications",
        content: `
            <h2>Introduction</h2>
            <p>Building scalable React applications requires careful planning and adherence to best practices. As applications grow, maintaining performance and code quality becomes increasingly important.</p>
            
            <h2>Component Architecture</h2>
            <p>A well-structured component architecture is the foundation of scalable React applications. Consider the following principles:</p>
            
            <h3>Single Responsibility Principle</h3>
            <p>Each component should have a single, well-defined responsibility. This makes components easier to test, maintain, and reuse.</p>
            
            <h3>Component Composition</h3>
            <p>Favor composition over inheritance. Build complex UIs by combining simple, reusable components.</p>
            
            <h2>State Management Strategies</h2>
            <p>Choosing the right state management solution is crucial for scalability:</p>
            
            <ul>
                <li>Local state for component-specific data</li>
                <li>Context API for medium-scale state sharing</li>
                <li>Redux/Zustand for complex global state</li>
                <li>Server state libraries like React Query</li>
            </ul>
            
            <h2>Performance Optimization</h2>
            <p>Implement performance optimization techniques early in the development process:</p>
            
            <h3>Code Splitting</h3>
            <p>Use React.lazy() and Suspense for lazy loading components and routes.</p>
            
            <h3>Memoization</h3>
            <p>Utilize React.memo, useMemo, and useCallback to prevent unnecessary re-renders.</p>
            
            <h2>Testing Strategy</h2>
            <p>Implement a comprehensive testing strategy including unit tests, integration tests, and end-to-end tests.</p>
            
            <h2>Conclusion</h2>
            <p>Building scalable React applications requires attention to architecture, state management, performance, and testing. Following these best practices will help ensure your application can grow and evolve over time.</p>
        `,
        featuredImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
        category: "technology"
    },
    {
        title: "The Rise of Remote Work: Transforming the Tech Industry",
        slug: "rise-of-remote-work-tech-industry",
        content: `
            <h2>A New Era of Work</h2>
            <p>The tech industry has undergone a massive transformation with the widespread adoption of remote work. What was once a perk has now become the standard for many companies worldwide.</p>
            
            <h2>Benefits of Remote Work</h2>
            <h3>For Employees:</h3>
            <ul>
                <li>Flexibility and better work-life balance</li>
                <li>No commute time and cost savings</li>
                <li>Ability to work from anywhere</li>
                <li>Increased autonomy and trust</li>
            </ul>
            
            <h3>For Employers:</h3>
            <ul>
                <li>Access to global talent pool</li>
                <li>Reduced overhead costs</li>
                <li>Higher employee retention rates</li>
                <li>Increased productivity</li>
            </ul>
            
            <h2>Challenges and Solutions</h2>
            <p>Remote work isn't without its challenges. Companies must address:</p>
            
            <h3>Communication</h3>
            <p>Implement robust communication tools and establish clear communication protocols.</p>
            
            <h3>Collaboration</h3>
            <p>Use virtual collaboration tools and establish regular team syncs.</p>
            
            <h3>Company Culture</h3>
            <p>Create virtual team-building activities and maintain regular social interactions.</p>
            
            <h2>The Future is Hybrid</h2>
            <p>Many companies are adopting hybrid models, combining the best of both worlds. This approach offers flexibility while maintaining some in-person collaboration.</p>
            
            <h2>Conclusion</h2>
            <p>Remote work has permanently changed the tech industry. Companies that embrace this change and adapt their practices will thrive in this new landscape.</p>
        `,
        featuredImage: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop",
        category: "business"
    },
    {
        title: "Web3 and the Decentralized Internet: What Developers Need to Know",
        slug: "web3-decentralized-internet-developers",
        content: `
            <h2>Understanding Web3</h2>
            <p>Web3 represents the next evolution of the internet - a decentralized, blockchain-based web where users have control over their data and digital assets.</p>
            
            <h2>Key Technologies</h2>
            <h3>Blockchain and Smart Contracts</h3>
            <p>Ethereum and other blockchain platforms enable the creation of decentralized applications (dApps) through smart contracts.</p>
            
            <h3>IPFS and Distributed Storage</h3>
            <p>InterPlanetary File System (IPFS) provides decentralized storage solutions, removing reliance on centralized servers.</p>
            
            <h3>Decentralized Identity</h3>
            <p>Users can control their digital identities through blockchain-based identity solutions.</p>
            
            <h2>Development Tools and Frameworks</h2>
            <ul>
                <li>Hardhat and Truffle for smart contract development</li>
                <li>Web3.js and Ethers.js for blockchain interaction</li>
                <li>MetaMask and other wallet integrations</li>
                <li>The Graph for decentralized data indexing</li>
            </ul>
            
            <h2>Challenges and Opportunities</h2>
            <h3>Technical Challenges:</h3>
            <ul>
                <li>Scalability issues with current blockchain infrastructure</li>
                <li>High gas fees and transaction costs</li>
                <li>User experience and adoption barriers</li>
            </ul>
            
            <h3>Opportunities:</h3>
            <ul>
                <li>True digital ownership</li>
                <li>Censorship-resistant platforms</li>
                <li>New economic models and incentives</li>
            </ul>
            
            <h2>Getting Started</h2>
            <p>Developers interested in Web3 should start with understanding blockchain basics, learning Solidity programming, and experimenting with existing dApps.</p>
            
            <h2>Conclusion</h2>
            <p>Web3 is still in its early stages, but it represents a fundamental shift in how we build and use internet applications. Developers who embrace this technology early will be well-positioned for the future.</p>
        `,
        featuredImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop",
        category: "technology"
    },
    {
        title: "Mental Health in Tech: Breaking the Silence",
        slug: "mental-health-tech-breaking-silence",
        content: `
            <h2>The Hidden Crisis</h2>
            <p>The tech industry is facing a mental health crisis. High pressure, constant innovation, and always-on culture are taking a toll on developers and tech professionals.</p>
            
            <h2>Common Challenges</h2>
            <h3>Burnout and Imposter Syndrome</h3>
            <p>Many tech workers experience burnout due to long hours and high expectations. Imposter syndrome is rampant, with many feeling they don't belong despite their achievements.</p>
            
            <h3>Anxiety and Depression</h3>
            <p>The fast-paced nature of tech, combined with job insecurity and performance pressure, contributes to anxiety and depression rates higher than many other industries.</p>
            
            <h2>Breaking the Stigma</h2>
            <p>It's time to break the silence around mental health in tech. Speaking openly about mental health struggles helps others feel less alone and encourages seeking help.</p>
            
            <h2>Creating Supportive Environments</h2>
            <h3>For Companies:</h3>
            <ul>
                <li>Provide mental health resources and support</li>
                <li>Promote work-life balance</li>
                <li>Create psychologically safe environments</li>
                <li>Train managers to recognize mental health issues</li>
            </ul>
            
            <h3>For Individuals:</h3>
            <ul>
                <li>Prioritize self-care and boundaries</li>
                <li>Seek professional help when needed</li>
                <li>Build support networks</li>
                <li>Practice mindfulness and stress management</li>
            </ul>
            
            <h2>Resources and Help</h2>
            <p>There are numerous resources available for tech professionals struggling with mental health:</p>
            
            <ul>
                <li>Employee Assistance Programs (EAPs)</li>
                <li>Mental health apps like Calm and Headspace</li>
                <li>Support groups and communities</li>
                <li>Therapy and counseling services</li>
            </ul>
            
            <h2>Conclusion</h2>
            <p>Mental health is as important as physical health. By creating open, supportive environments and providing adequate resources, the tech industry can become a place where people thrive both professionally and personally.</p>
        `,
        featuredImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
        category: "lifestyle"
    },
    {
        title: "The JavaScript Ecosystem in 2024: Trends and Predictions",
        slug: "javascript-ecosystem-2024-trends-predictions",
        content: `
            <h2>The Ever-Evolving JavaScript Landscape</h2>
            <p>JavaScript continues to dominate the web development landscape, with constant innovation and new tools emerging regularly. Let's explore the current trends and what's coming next.</p>
            
            <h2>Framework Evolution</h2>
            <h3>React's Continued Dominance</h3>
            <p>React maintains its position as the most popular frontend framework, with React 18 bringing concurrent features and improved performance.</p>
            
            <h3>The Rise of Vue 3 and Nuxt</h3>
            <p>Vue 3's Composition API and excellent TypeScript support have made it increasingly popular, especially with the Nuxt framework for full-stack applications.</p>
            
            <h3>Svelte's Growing Adoption</h3>
            <p>Svelte's compile-time approach and excellent performance are winning over developers looking for alternatives to traditional frameworks.</p>
            
            <h2>Build Tools and Bundlers</h2>
            <h3>Vite's Revolution</h3>
            <p>Vite has transformed the development experience with its lightning-fast hot module replacement and optimized builds.</p>
            
            <h3>Turbopack and Next.js</h3>
            <p>Next.js 13 with Turbopack promises significantly faster builds and an improved development experience.</p>
            
            <h2>TypeScript's Mainstream Adoption</h2>
            <p>TypeScript is no longer optional for many teams. Its type safety and improved developer experience make it the default choice for new projects.</p>
            
            <h2>Emerging Trends</h2>
            <h3>Edge Computing</h3>
            <p>JavaScript is moving to the edge with platforms like Cloudflare Workers and Deno Deploy.</p>
            
            <h3>WebAssembly Integration</h3>
            <p>WASM is enabling high-performance applications in the browser, with JavaScript serving as the glue language.</p>
            
            <h3>AI-Assisted Development</h3>
            <p>AI tools are becoming integral to the JavaScript development workflow, from code generation to debugging assistance.</p>
            
            <h2>What's Next?</h2>
            <p>The JavaScript ecosystem will continue to evolve rapidly. Key areas to watch include:</p>
            
            <ul>
                <li>Improved TypeScript performance and features</li>
                <li>Better CSS-in-JS solutions</li>
                <li>Enhanced developer tools and debugging</li>
                <li>More focus on performance and accessibility</li>
            </ul>
            
            <h2>Conclusion</h2>
            <p>JavaScript's ecosystem shows no signs of slowing down. Staying current with these trends will help developers make informed decisions and build better applications.</p>
        `,
        featuredImage: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop",
        category: "technology"
    },
    {
        title: "Cybersecurity Best Practices for Modern Web Applications",
        slug: "cybersecurity-best-practices-modern-web-applications",
        content: `
            <h2>The Growing Importance of Web Security</h2>
            <p>As web applications become more complex and handle increasingly sensitive data, cybersecurity has never been more critical. A single vulnerability can lead to devastating consequences.</p>
            
            <h2>Common Security Threats</h2>
            <h3>Injection Attacks</h3>
            <p>SQL injection, NoSQL injection, and command injection remain among the most common and dangerous vulnerabilities.</p>
            
            <h3>Cross-Site Scripting (XSS)</h3>
            <p>XSS attacks allow malicious scripts to be executed in users' browsers, potentially stealing sensitive information.</p>
            
            <h3>Cross-Site Request Forgery (CSRF)</h3>
            <p>CSRF attacks trick users into performing unwanted actions on web applications where they're authenticated.</p>
            
            <h2>Essential Security Practices</h2>
            <h3>Input Validation and Sanitization</h3>
            <p>Never trust user input. Validate and sanitize all data on both client and server sides.</p>
            
            <h3>Use HTTPS Everywhere</h3>
            <p>Encrypt all communication using SSL/TLS certificates. Let's Encrypt makes this easy and free.</p>
            
            <h3>Implement Proper Authentication</h3>
            <ul>
                <li>Use strong password policies</li>
                <li>Implement multi-factor authentication</li>
                <li>Use secure session management</li>
                <li>Implement rate limiting</li>
            </ul>
            
            <h3>Security Headers</h3>
            <p>Implement security headers like CSP, HSTS, X-Frame-Options, and others to protect against various attacks.</p>
            
            <h2>Database Security</h2>
            <h3>Parameterized Queries</h3>
            <p>Always use parameterized queries or ORM methods to prevent SQL injection attacks.</p>
            
            <h3>Principle of Least Privilege</h3>
            <p>Grant database users only the permissions they need to perform their tasks.</p>
            
            <h2>Frontend Security</h2>
            <h3>Content Security Policy (CSP)</h3>
            <p>Implement CSP to control which resources can be loaded by your application.</p>
            
            <h3>Secure Cookie Practices</h3>
            <p>Use HttpOnly, Secure, and SameSite attributes for cookies to prevent XSS and CSRF attacks.</p>
            
            <h2>Regular Security Audits</h2>
            <ul>
                <li>Conduct regular penetration testing</li>
                <li>Use automated security scanning tools</li>
                <li>Keep dependencies updated</li>
                <li>Monitor for security vulnerabilities</li>
            </ul>
            
            <h2>Conclusion</h2>
            <p>Security is not a one-time implementation but an ongoing process. By following these best practices and staying vigilant, you can significantly improve your web application's security posture.</p>
        `,
        featuredImage: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop",
        category: "technology"
    },
    {
        title: "The Business Side of Tech: Startups, Funding, and Growth",
        slug: "business-side-tech-startups-funding-growth",
        content: `
            <h2>From Code to Company</h2>
            <p>Many developers dream of turning their ideas into successful startups. Understanding the business side of tech is crucial for turning technical innovation into commercial success.</p>
            
            <h2>The Startup Journey</h2>
            <h3>Idea Validation</h3>
            <p>Before writing a single line of code, validate your idea. Talk to potential customers, understand their pain points, and ensure there's a real market need.</p>
            
            <h3>Minimum Viable Product (MVP)</h3>
            <p>Build the smallest possible version of your product that solves the core problem. Focus on delivering value quickly and gathering feedback.</p>
            
            <h2>Funding Options</h2>
            <h3>Bootstrapping</h3>
            <p>Using your own savings or revenue to fund growth. This gives you full control but may limit growth speed.</p>
            
            <h3>Angel Investors</h3>
            <p>Individual investors who provide capital in exchange for equity. They often bring valuable expertise and networks.</p>
            
            <h3>Venture Capital</h3>
            <p>Institutional investors who provide larger funding rounds in exchange for equity. VC funding can accelerate growth but comes with high expectations.</p>
            
            <h2>Growth Strategies</h2>
            <h3>Product-Market Fit</h3>
            <p>Achieve product-market fit before scaling. This means having a product that strongly satisfies market demand.</p>
            
            <h3>Customer Acquisition</h3>
            <p>Develop sustainable customer acquisition strategies. Focus on channels that provide the best return on investment.</p>
            
            <h3>Metrics That Matter</h3>
            <ul>
                <li>Customer Acquisition Cost (CAC)</li>
                <li>Lifetime Value (LTV)</li>
                <li>Monthly Recurring Revenue (MRR)</li>
                <li>Churn Rate</li>
                <li>Net Promoter Score (NPS)</li>
            </ul>
            
            <h2>Building a Team</h2>
            <h3>Hiring Strategy</h3>
            <p>Hire slowly and carefully. Look for people who share your vision and bring complementary skills.</p>
            
            <h3>Company Culture</h3>
            <p>Establish a strong company culture early. This will attract the right talent and help retain employees.</p>
            
            <h2>Scaling Challenges</h2>
            <ul>
                <li>Maintaining code quality as the team grows</li>
                <li>Managing technical debt</li>
                <li>Scaling infrastructure</li>
                <li>Preserving company culture</li>
                <li>Customer support at scale</li>
            </ul>
            
            <h2>Exit Strategies</h2>
            <h3>Acquisition</h3>
            <p>Being acquired by a larger company can provide a successful exit for founders and investors.</p>
            
            <h3>IPO</h3>
            <p>Going public through an Initial Public Offering represents a major milestone but comes with increased scrutiny and regulation.</p>
            
            <h2>Conclusion</h2>
            <p>Building a successful tech startup requires more than just technical skills. Understanding the business aspects, from funding to growth strategies, is essential for long-term success.</p>
        `,
        featuredImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=400&fit=crop",
        category: "business"
    }
];

const sampleCategories = [
    { name: "Technology", slug: "technology" },
    { name: "Business", slug: "business" },
    { name: "Lifestyle", slug: "lifestyle" },
    { name: "Design", slug: "design" },
    { name: "Science", slug: "science" }
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_DB, {dbName: "Blog"});
        console.log('Connected to MongoDB');

        // Clear existing data
        await Blog.deleteMany({});
        await Category.deleteMany({});
        await User.deleteMany({});
        console.log('Cleared existing data');

        // Create sample user
        const hashedPassword = await bcrypt.hash('admin123', 12);
        const sampleUser = new User({
            name: 'Admin User',
            email: 'admin@blog.com',
            password: hashedPassword,
            role: 'admin',
            bio: 'Passionate about technology and sharing knowledge with the community.',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        });
        await sampleUser.save();
        console.log('Created sample user');

        // Create categories
        const createdCategories = await Category.insertMany(sampleCategories);
        console.log(`Created ${createdCategories.length} categories`);

        // Create blogs
        const blogsToCreate = sampleBlogs.map((blog, index) => {
            const category = createdCategories.find(cat => cat.slug === blog.category);
            return {
                title: blog.title,
                slug: `${blog.slug}-${Math.round(Math.random() * 100000)}`,
                blogContent: blog.content,
                featuredImage: blog.featuredImage,
                author: sampleUser._id,
                category: category._id
            };
        });

        await Blog.insertMany(blogsToCreate);
        console.log(`Created ${blogsToCreate.length} sample blogs`);

        console.log('Database seeded successfully!');
        console.log('Login credentials:');
        console.log('Email: admin@blog.com');
        console.log('Password: admin123');

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

seedDatabase();
