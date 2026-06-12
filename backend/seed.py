from database import SessionLocal, engine, Base
from models import Topic, MemoryStrength

TOPICS_DATA = [
    # Cloud Concepts
    {"name": "Cloud Computing", "category": "Cloud Concepts", "content_ar": "الحوسبة السحابية هي تقديم خدمات الحوسبة عبر الإنترنت بما في ذلك الخوادم والتخزين وقواعد البيانات والشبكات والبرامج والتحليلات والذكاء الاصطناعي."},
    {"name": "IaaS", "category": "Cloud Concepts", "content_ar": "البنية التحتية كخدمة (IaaS) توفر موارد حوسبة افتراضية عبر الإنترنت. أنت تدير نظام التشغيل والتطبيقات، والمزود يدير الأجهزة."},
    {"name": "PaaS", "category": "Cloud Concepts", "content_ar": "المنصة كخدمة (PaaS) توفر بيئة لتطوير ونشر التطبيقات دون القلق بشأن إدارة البنية التحتية."},
    {"name": "SaaS", "category": "Cloud Concepts", "content_ar": "البرمجيات كخدمة (SaaS) تقدم تطبيقات جاهزة عبر الإنترنت مثل Office 365 و Outlook. المستخدم يستخدم فقط دون إدارة أي شيء."},
    {"name": "Public Cloud", "category": "Cloud Concepts", "content_ar": "السحابة العامة مملوكة لمزود خدمات سحابية ويتم مشاركة الموارد بين عدة مستأجرين. توفر مرونة عالية وتكلفة منخفضة."},
    {"name": "Private Cloud", "category": "Cloud Concepts", "content_ar": "السحابة الخاصة مخصصة لمنظمة واحدة فقط. توفر تحكم أكبر وأمان أعلى لكن بتكلفة أكبر."},
    {"name": "Hybrid Cloud", "category": "Cloud Concepts", "content_ar": "السحابة الهجينة تجمع بين السحابة العامة والخاصة، مما يسمح بنقل البيانات والتطبيقات بينهما."},

    # Azure Architecture
    {"name": "Regions", "category": "Azure Architecture", "content_ar": "المناطق (Regions) هي مواقع جغرافية حول العالم تحتوي على مراكز بيانات Azure. كل منطقة مستقلة وتوفر خدمات محلية."},
    {"name": "Availability Zones", "category": "Azure Architecture", "content_ar": "مناطق التوفر هي مواقع منفصلة فعلياً داخل منطقة Azure. كل منطقة توفر لها طاقة وشبكة وتبريد مستقل."},
    {"name": "Resource Groups", "category": "Azure Architecture", "content_ar": "مجموعات الموارد هي حاويات منطقية تجمع الموارد المرتبطة لحل Azure. تسهل إدارة ومراقبة الموارد."},
    {"name": "Azure Subscriptions", "category": "Azure Architecture", "content_ar": "الاشتراكات هي وحدة إدارة وفوترة في Azure. كل اشتراك له حدود وسياسات خاصة به."},
    {"name": "Management Groups", "category": "Azure Architecture", "content_ar": "مجموعات الإدارة توفر مستوى أعلى من التنظيم فوق الاشتراكات. تسمح بتطبيق سياسات على عدة اشتراكات."},

    # Compute
    {"name": "Virtual Machines", "category": "Compute", "content_ar": "الأجهزة الافتراضية (VMs) هي محاكاة لأجهزة كمبيوتر فعلية. توفر تحكم كامل في نظام التشغيل والبرامج."},
    {"name": "App Service", "category": "Compute", "content_ar": "خدمة التطبيقات هي منصة PaaS لاستضافة تطبيقات الويب وواجهات API والتطبيقات المحمولة دون إدارة البنية التحتية."},
    {"name": "Azure Functions", "category": "Compute", "content_ar": "الدوال (Functions) هي حوسبة بدون خادم (Serverless). تنفذ كود عند حدوث أحداث معينة وتدفع فقط مقابل وقت التنفيذ."},
    {"name": "Azure Kubernetes Service", "category": "Compute", "content_ar": "خدمة Kubernetes هي خدمة مُدارة لنشر وإدارة التطبيقات المعبأة في حاويات (Containers) بسهولة."},
    {"name": "Container Instances", "category": "Compute", "content_ar": "مثيلات الحاويات توفر أسرع وأبسط طريقة لتشغيل حاوية في Azure دون إدارة أجهزة افتراضية."},

    # Networking
    {"name": "Virtual Network", "category": "Networking", "content_ar": "الشبكة الافتراضية (VNet) هي شبكة خاصة معزولة في Azure. تمكن الموارد من التواصل بأمان مع بعضها."},
    {"name": "VPN Gateway", "category": "Networking", "content_ar": "بوابة VPN تربط شبكتك المحلية بشبكة Azure الافتراضية عبر اتصال مشفر عبر الإنترنت."},
    {"name": "Azure Load Balancer", "category": "Networking", "content_ar": "موازن التحميل يوزع حركة المرور الواردة بين عدة أجهزة افتراضية لضمان التوفر العالي والأداء."},
    {"name": "ExpressRoute", "category": "Networking", "content_ar": "ExpressRoute يوفر اتصال خاص ومباشر بين شبكتك المحلية و Azure دون المرور عبر الإنترنت العام."},
    {"name": "DNS", "category": "Networking", "content_ar": "Azure DNS يستضيف نطاقات DNS ويوفر تحليل الأسماء باستخدام بنية Microsoft التحتية."},

    # Storage
    {"name": "Blob Storage", "category": "Storage", "content_ar": "تخزين البيانات الثنائية الكبيرة (Blob) مُحسّن لتخزين كميات هائلة من البيانات غير المهيكلة مثل النصوص والصور."},
    {"name": "Azure Files", "category": "Storage", "content_ar": "ملفات Azure توفر مشاركات ملفات سحابية مُدارة بالكامل يمكن الوصول إليها عبر بروتوكول SMB."},
    {"name": "Storage Tiers", "category": "Storage", "content_ar": "مستويات التخزين: Hot للبيانات المستخدمة بكثرة، Cool للبيانات قليلة الاستخدام، Archive للبيانات نادرة الوصول."},
    {"name": "Disk Storage", "category": "Storage", "content_ar": "تخزين الأقراص يوفر أقراص مُدارة للأجهزة الافتراضية. يتوفر بأنواع: Ultra, Premium SSD, Standard SSD, Standard HDD."},

    # Security
    {"name": "Azure Active Directory", "category": "Security", "content_ar": "Azure AD هو خدمة إدارة الهوية والوصول السحابية. يوفر تسجيل دخول أحادي ومصادقة متعددة العوامل."},
    {"name": "Multi-Factor Authentication", "category": "Security", "content_ar": "المصادقة متعددة العوامل (MFA) تطلب أكثر من طريقة للتحقق من الهوية: شيء تعرفه + شيء تملكه + شيء أنت عليه."},
    {"name": "Network Security Groups", "category": "Security", "content_ar": "مجموعات أمان الشبكة (NSG) تحتوي على قواعد أمان تسمح أو ترفض حركة المرور من وإلى موارد Azure."},
    {"name": "Azure Firewall", "category": "Security", "content_ar": "جدار حماية Azure هو خدمة أمان شبكة مُدارة وقائمة على السحابة تحمي موارد شبكة Azure الافتراضية."},
    {"name": "Azure Key Vault", "category": "Security", "content_ar": "خزنة المفاتيح تخزن وتدير الأسرار والمفاتيح والشهادات بشكل آمن ومركزي."},

    # Cost Management
    {"name": "Azure Pricing", "category": "Cost Management", "content_ar": "تسعير Azure يعتمد على الاستهلاك (Pay-as-you-go). تدفع فقط مقابل ما تستخدمه بدون التزام مسبق."},
    {"name": "TCO Calculator", "category": "Cost Management", "content_ar": "حاسبة التكلفة الإجمالية للملكية (TCO) تقارن تكلفة تشغيل البنية التحتية محلياً مقابل Azure."},
    {"name": "Azure Cost Management", "category": "Cost Management", "content_ar": "إدارة التكاليف توفر أدوات لمراقبة وتخصيص وتحسين إنفاق Azure مع ميزانيات وتنبيهات."},
    {"name": "Reserved Instances", "category": "Cost Management", "content_ar": "المثيلات المحجوزة توفر خصم يصل إلى 72% مقابل الالتزام بمدة سنة أو ثلاث سنوات."},

    # Governance
    {"name": "Azure Policy", "category": "Governance", "content_ar": "سياسات Azure تفرض قواعد ومعايير على الموارد لضمان الامتثال للمتطلبات التنظيمية والمؤسسية."},
    {"name": "Azure Blueprints", "category": "Governance", "content_ar": "المخططات (Blueprints) تمكن من تعريف مجموعة قابلة للتكرار من موارد Azure تلتزم بمعايير المؤسسة."},
    {"name": "Role-Based Access Control", "category": "Governance", "content_ar": "التحكم في الوصول المستند إلى الأدوار (RBAC) يدير من يمكنه الوصول لموارد Azure وماذا يمكنهم فعله."},
    {"name": "Resource Locks", "category": "Governance", "content_ar": "أقفال الموارد تمنع الحذف أو التعديل غير المقصود. نوعان: ReadOnly (قراءة فقط) و Delete (منع الحذف)."},
    {"name": "Tags", "category": "Governance", "content_ar": "العلامات (Tags) هي أزواج مفتاح-قيمة تُطبق على الموارد لتنظيمها وتصنيفها لأغراض الإدارة والفوترة."},
]


def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    existing = db.query(Topic).count()
    if existing > 0:
        print(f"Database already has {existing} topics. Skipping seed.")
        db.close()
        return

    for topic_data in TOPICS_DATA:
        topic = Topic(**topic_data)
        db.add(topic)
        db.flush()

        memory = MemoryStrength(topic_id=topic.id, strength=0.0, review_count=0)
        db.add(memory)

    db.commit()
    print(f"Seeded {len(TOPICS_DATA)} topics successfully.")
    db.close()


if __name__ == "__main__":
    seed_database()
