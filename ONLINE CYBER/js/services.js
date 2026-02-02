// Services Module - Updated for local development
const Services = {
    cyberServices: [
        {
            id: 'internet',
            name: 'High-Speed Internet',
            description: 'Lightning-fast fiber internet for browsing, streaming, downloading, and online services.',
            price: 'From KES 50/hour',
            image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80',
            icon: 'fa-wifi'
        },
        {
            id: 'printing',
            name: 'Printing & Photocopying',
            description: 'High-quality color and black & white printing, scanning, and photocopying services.',
            price: 'From KES 10/page',
            image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            icon: 'fa-print'
        },
        {
            id: 'typing',
            name: 'Typing & Formatting',
            description: 'Professional typing services for documents, CVs, letters, and online applications.',
            price: 'KES 40/= per page',
            image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=2068&q=80',
            icon: 'fa-keyboard'
        },
        {
            id: 'computer-packages',
            name: 'Computer Packages',
            description: 'MS Word, Excel, PowerPoint training with certificates and transcripts upon completion.',
            price: 'Courses Available',
            image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            icon: 'fa-laptop-code'
        },
        {
            id: 'scanning',
            name: 'Scanning Services',
            description: 'High-quality document and photo scanning with editing and formatting options.',
            price: 'From KES 20/page',
            image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            icon: 'fa-scanner'
        },
        {
            id: 'binding',
            name: 'Document Binding',
            description: 'Professional document binding, laminating, and finishing services for reports and presentations.',
            price: 'From KES 100',
            image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            icon: 'fa-book'
        }
    ],
    
    governmentServices: [
        {
            id: 'kra',
            name: 'KRA Services',
            description: 'New KRA PIN registration, Lost KRA PIN, Change KRA email, File KRA returns, ETIMS registration & invoices',
            price: 'KES 300-1000',
            icon: 'fa-file-invoice-dollar',
            category: 'tax'
        },
        {
            id: 'ecitizen',
            name: 'eCitizen Services',
            description: 'Account creation, Change phone number, Passport application, Good conduct/PCC, Business registration',
            price: 'KES 200-500',
            icon: 'fa-passport',
            category: 'government'
        },
        {
            id: 'ntsa',
            name: 'NTSA Services',
            description: 'Logbook transfer, New generation plates, DL renewal, Apply smart DL, PDL/Interim, Test booking',
            price: 'KES 500-2000',
            icon: 'fa-car',
            category: 'transport'
        },
        {
            id: 'helb',
            name: 'HELB/HEF Services',
            description: 'HELB loans, HEF applications, Clearance certificates, Loan repayment, Scholarship applications',
            price: 'KES 300-800',
            icon: 'fa-graduation-cap',
            category: 'education'
        },
        {
            id: 'tsc',
            name: 'TSC Services',
            description: 'New teacher registration, Wealth declaration, Appraisals, Promotions, Sick leave, Recruitment',
            price: 'KES 500-1500',
            icon: 'fa-chalkboard-teacher',
            category: 'education'
        },
        {
            id: 'nssf',
            name: 'NSSF/SHA Services',
            description: 'New NSSF registration, Lost NSSF card, SHA registration, SHIF registration, Add dependants',
            price: 'KES 300-700',
            icon: 'fa-shield-alt',
            category: 'social'
        },
        {
            id: 'kuccps',
            name: 'KUCCPS Services',
            description: 'Placement, Admission letters, TVET applications, Subsequent applications, Troubleshooting',
            price: 'KES 200-500',
            icon: 'fa-university',
            category: 'education'
        },
        {
            id: 'business',
            name: 'Business Registration',
            description: 'Company registration, Business name registration, AGPO application and approval, Tax compliance',
            price: 'KES 1000-5000',
            icon: 'fa-briefcase',
            category: 'business'
        },
        {
            id: 'police',
            name: 'Police Clearance',
            description: 'Good conduct certificate, Police clearance certificate, Fingerprinting services',
            price: 'KES 1000-1500',
            icon: 'fa-id-card',
            category: 'security'
        },
        {
            id: 'health',
            name: 'Health Services',
            description: 'COVID-19 certificate download, NHIF registration, Medical insurance, Clinic registration',
            price: 'KES 200-1000',
            icon: 'fa-heartbeat',
            category: 'health'
        },
        {
            id: 'metropol',
            name: 'Credit Services',
            description: 'Metropol, Transunion, Credit info, CRB clearance, Credit report, Score improvement',
            price: 'KES 500-2000',
            icon: 'fa-credit-card',
            category: 'finance'
        },
        {
            id: 'photoshop',
            name: 'Photo Editing',
            description: 'Photo editing, passport photos, document photos, ID photos, Photoshop services',
            price: 'KES 100-500',
            icon: 'fa-camera',
            category: 'design'
        },
        {
            id: 'downloads',
            name: 'Downloads & Uploads',
            description: 'File downloads, document uploads, online form submissions, application uploads',
            price: 'KES 50-200',
            icon: 'fa-download',
            category: 'digital'
        },
        {
            id: 'troubleshooting',
            name: 'IT Troubleshooting',
            description: 'Computer troubleshooting, software installation, virus removal, system setup',
            price: 'KES 500-2000',
            icon: 'fa-tools',
            category: 'technical'
        },
       
            {
                id: 'birth-certificate',
                name: 'Birth Certificate Services',
                description: 'Apply for new birth certificate, replacement, correction of details, and collection.',
                price: 'KES 300-800',
                icon: 'fa-baby',
                category: 'civil-registration'
            },
            
            {
                id: 'marriage-certificate',
                name: 'Marriage Certificate',
                description: 'Marriage registration, certificate application, and replacement services.',
                price: 'KES 500-1200',
                icon: 'fa-ring',
                category: 'civil-registration'
            },
            
            {
                id: 'death-certificate',
                name: 'Death Certificate',
                description: 'Death registration and certificate application services.',
                price: 'KES 300-800',
                icon: 'fa-cross',
                category: 'civil-registration'
            },
            
            {
                id: 'id-card',
                name: 'National ID Card',
                description: 'New ID application, replacement of lost ID, change of details, collection.',
                price: 'KES 500-1000',
                icon: 'fa-id-card',
                category: 'registration'
            },
            
            {
                id: 'pin-certificate',
                name: 'PIN Certificate',
                description: 'Apply for PIN certificate, replacement, and printing services.',
                price: 'KES 200-500',
                icon: 'fa-file-certificate',
                category: 'tax'
            },
            
            {
                id: 'export-import',
                name: 'Export/Import License',
                description: 'Apply for export/import licenses, customs documentation, and clearance.',
                price: 'KES 2000-5000',
                icon: 'fa-ship',
                category: 'business'
            },
            
            {
                id: 'single-permit',
                name: 'Single Work Permit',
                description: 'Application for single work permits for foreigners in Kenya.',
                price: 'KES 3000-8000',
                icon: 'fa-passport',
                category: 'immigration'
            },
            
            {
                id: 'dependant-pass',
                name: 'Dependant Pass',
                description: 'Application for dependant passes for family members of work permit holders.',
                price: 'KES 2000-5000',
                icon: 'fa-users',
                category: 'immigration'
            }
        ],
        

    
    partners: [
        {
            name: 'Kenya Revenue Authority',
            logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Kenya_Revenue_Authority_Logo.svg/320px-Kenya_Revenue_Authority_Logo.svg.png',
            alt: 'KRA Logo',
            website: 'https://www.kra.go.ke'
        },
        {
            name: 'eCitizen',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/E-citizen_Kenya_Logo.svg/320px-E-citizen_Kenya_Logo.svg.png',
            alt: 'eCitizen Logo',
            website: 'https://www.ecitizen.go.ke'
        },
        {
            name: 'National Transport and Safety Authority',
            logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/National_Transport_and_Safety_Authority_logo.svg/320px-National_Transport_and_Safety_Authority_logo.svg.png',
            alt: 'NTSA Logo',
            website: 'https://www.ntsa.go.ke'
        },
        {
            name: 'National Social Security Fund',
            logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/82/National_Social_Security_Fund_%28Kenya%29_logo.svg/320px-National_Social_Security_Fund_%28Kenya%29_logo.svg.png',
            alt: 'NSSF Logo',
            website: 'https://www.nssf.or.ke'
        },
        {
            name: 'Teachers Service Commission',
            logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e9/Teachers_Service_Commission_%28Kenya%29_Logo.svg/320px-Teachers_Service_Commission_%28Kenya%29_Logo.svg.png',
            alt: 'TSC Logo',
            website: 'https://www.tsc.go.ke'
        },
        {
            name: 'Higher Education Loans Board',
            logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Helb_logo.svg/320px-Helb_logo.svg.png',
            alt: 'HELB Logo',
            website: 'https://www.helb.co.ke'
        },
        {
            name: 'Kenya Universities and Colleges Central Placement Service',
            logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/61/KUCCPS_Logo.svg/320px-KUCCPS_Logo.svg.png',
            alt: 'KUCCPS Logo',
            website: 'https://www.kuccps.ac.ke'
        },
        {
            name: 'Social Health Authority',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Social_Health_Authority_Kenya_Logo.svg/320px-Social_Health_Authority_Kenya_Logo.svg.png',
            alt: 'SHA Logo',
            website: 'https://sha.go.ke'
        }
    ],
    
    pricingPlans: [
        {
            id: 'basic',
            name: 'Basic User',
            price: 'KES 50/hour',
            features: [
                'Internet Access',
                'Basic Computer Use',
                'Email & Browsing',
                'Document Printing (extra)',
                'Scanning Services'
            ],
            icon: 'fa-user',
            popular: false
        },
        {
            id: 'premium',
            name: 'Premium User',
            price: 'KES 80/hour',
            features: [
                'High-Speed Internet',
                'Premium Computer',
                '10 Free B/W Prints',
                'Basic Gaming',
                'Scanner Access',
                'Priority Support'
            ],
            icon: 'fa-user-tie',
            popular: true
        },
        {
            id: 'gamer',
            name: 'Gamer Package',
            price: 'KES 120/hour',
            features: [
                'Gaming PC Access',
                'High-Speed Internet',
                'Popular Games Installed',
                'Gaming Chair',
                'Headset Available',
                'Snack Bar Discount'
            ],
            icon: 'fa-gamepad',
            popular: false
        },
        {
            id: 'student',
            name: 'Student Package',
            price: 'KES 40/hour',
            features: [
                'Discounted Internet',
                'Academic Research',
                'Free Printing (5 pages/day)',
                'Library Access',
                'Group Study Discount'
            ],
            icon: 'fa-graduation-cap',
            popular: false
        }
    ],
    
    contactInfo: {
        phone: "0748156905",
        phone2: "0780003131",
        email: "info@imarishatech.co.ke",
        address: "Nairobi CBD, Kenya",
        hours: {
            weekdays: "7:00 AM - 11:00 PM",
            weekends: "9:00 AM - 10:00 PM",
            holidays: "10:00 AM - 8:00 PM"
        },
        socialMedia: {
            facebook: "https://facebook.com/imarishatech",
            twitter: "https://twitter.com/imarishatech",
            instagram: "https://instagram.com/imarishatech",
            whatsapp: "https://wa.me/254748156905"
        }
    },
    
    quickLinks: {
        services: [
            { name: "KRA Services", url: "#kra-services" },
            { name: "NTSA Services", url: "#ntsa-services" },
            { name: "HELB Services", url: "#helb-services" },
            { name: "TSC Services", url: "#tsc-services" },
            { name: "eCitizen Services", url: "#ecitizen-services" },
            { name: "Printing Services", url: "#printing" }
        ],
        resources: [
            { name: "Courses", url: "/courses" },
            { name: "Blog", url: "/blog" },
            { name: "Downloads", url: "/downloads" },
            { name: "Tech News", url: "/news" },
            { name: "Student Portal", url: "/student-portal" },
            { name: "Data Protection", url: "/data-protection" }
        ],
        legal: [
            { name: "Terms of Service", url: "/terms" },
            { name: "Privacy Policy", url: "/privacy" },
            { name: "Cookie Policy", url: "/cookies" },
            { name: "Refund Policy", url: "/refunds" }
        ]
    },

    // Initialize services (empty function for compatibility)
    async init() {
        console.log('Services initialized with embedded data');
        return true;
    },

    // Get service by ID
    getServiceById(id) {
        return this.governmentServices.find(service => service.id === id);
    },

    // Get cyber service by ID
    getCyberServiceById(id) {
        return this.cyberServices.find(service => service.id === id);
    },

    // Get all services by category
    getServicesByCategory(category) {
        return this.governmentServices.filter(service => service.category === category);
    },

    // Get pricing plan by ID
    getPricingPlanById(id) {
        return this.pricingPlans.find(plan => plan.id === id);
    },

    // Get contact information
    getContactInfo() {
        return this.contactInfo;
    },

    // Get quick links by category
    getQuickLinks(category) {
        return this.quickLinks[category] || [];
    },

    // Submit service request
    async submitServiceRequest(serviceId, details, urgency) {
        if (!Auth.isLoggedIn()) {
            throw new Error('User must be logged in to submit service requests');
        }

        const service = this.getServiceById(serviceId);
        if (!service) {
            throw new Error('Service not found');
        }

        try {
            const requestData = {
                userId: Auth.getUserId(),
                serviceId: service.id,
                serviceName: service.name,
                details: details,
                urgency: urgency,
                cost: service.price,
                status: 'pending',
                createdAt: Firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: Firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await Firebase.db.collection('serviceRequests').add(requestData);
            return { success: true, id: docRef.id, ...requestData };
        } catch (error) {
            console.error('Error submitting service request:', error);
            throw error;
        }
    },

    // Get user service requests
    async getUserServiceRequests(userId) {
        try {
            const snapshot = await Firebase.db.collection('serviceRequests')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting service requests:', error);
            throw error;
        }
    },

    // Get service request statistics
    
    async getServiceRequestStats(userId) {
        try {
            const requests = await this.getUserServiceRequests(userId);
            
            const stats = {
                total: requests.length,
                pending: requests.filter(r => r.status === 'pending').length,
                completed: requests.filter(r => r.status === 'completed').length,
                processing: requests.filter(r => r.status === 'processing').length,
                totalSpent: requests
                    .filter(r => r.status === 'completed' && r.cost)
                    .reduce((sum, r) => {
                        const cost = parseInt(r.cost.replace(/[^\d]/g, '')) || 0;
                        return sum + cost;
                    }, 0)
            };

            return stats;
        } catch (error) {
            console.error('Error getting service request stats:', error);
            throw error;
        }
    }
};
