/* ============================================================
   MEDICARE — DATA: SPECIALTIES
   Dữ liệu chuyên khoa mẫu

   Quy ước:
   - id: Number
   - slug: duy nhất
   - icon: tên icon semantic, KHÔNG chứa emoji
   - status: active | inactive
   - featured: hiển thị nổi bật
   - showMenu: cho phép xuất hiện trong menu
   - order: thứ tự hiển thị
   - doctorCount chỉ là dữ liệu seed ban đầu
   ============================================================ */

const SPECIALTIES_DATA = [
  /* ============================================================
     01. TIM MẠCH
     ============================================================ */
  {
    id: 1,

    name: 'Tim mạch',
    slug: 'tim-mach',

    icon: 'heart',

    description:
      'Thăm khám, chẩn đoán và điều trị các bệnh lý tim mạch, huyết áp, rối loạn nhịp tim và các vấn đề liên quan đến hệ tuần hoàn.',

    doctorCount: 2,

    status: 'active',

    featured: true,
    showMenu: true,

    order: 1,

    metaTitle:
      'Chuyên khoa Tim mạch | MediCare',

    metaDescription:
      'Tìm bác sĩ Tim mạch và đặt lịch khám trực tuyến nhanh chóng tại MediCare.',

    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },


  /* ============================================================
     02. NHI KHOA
     ============================================================ */
  {
    id: 2,

    name: 'Nhi khoa',
    slug: 'nhi-khoa',

    icon: 'baby',

    description:
      'Chăm sóc sức khỏe, theo dõi sự phát triển và thăm khám các bệnh lý thường gặp ở trẻ sơ sinh, trẻ nhỏ và trẻ vị thành niên.',

    doctorCount: 1,

    status: 'active',

    featured: true,
    showMenu: true,

    order: 2,

    metaTitle:
      'Chuyên khoa Nhi khoa | MediCare',

    metaDescription:
      'Tìm bác sĩ Nhi khoa và đặt lịch khám cho trẻ trực tuyến tại MediCare.',

    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },


  /* ============================================================
     03. DA LIỄU
     ============================================================ */
  {
    id: 3,

    name: 'Da liễu',
    slug: 'da-lieu',

    icon: 'dermatology',

    description:
      'Thăm khám và điều trị các bệnh lý về da, tóc, móng, rối loạn sắc tố và các vấn đề da liễu thường gặp.',

    doctorCount: 1,

    status: 'active',

    featured: true,
    showMenu: true,

    order: 3,

    metaTitle:
      'Chuyên khoa Da liễu | MediCare',

    metaDescription:
      'Tìm bác sĩ Da liễu và đặt lịch khám trực tuyến nhanh chóng tại MediCare.',

    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },


  /* ============================================================
     04. TAI MŨI HỌNG
     ============================================================ */
  {
    id: 4,

    name: 'Tai Mũi Họng',
    slug: 'tai-mui-hong',

    icon: 'ear',

    description:
      'Thăm khám, nội soi và điều trị các bệnh lý về tai, mũi, họng, xoang, thanh quản và thính lực.',

    doctorCount: 1,

    status: 'active',

    featured: true,
    showMenu: true,

    order: 4,

    metaTitle:
      'Chuyên khoa Tai Mũi Họng | MediCare',

    metaDescription:
      'Tìm bác sĩ Tai Mũi Họng và đặt lịch khám trực tuyến tại MediCare.',

    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },


  /* ============================================================
     05. RĂNG HÀM MẶT
     ============================================================ */
  {
    id: 5,

    name: 'Răng Hàm Mặt',
    slug: 'rang-ham-mat',

    icon: 'tooth',

    description:
      'Thăm khám và chăm sóc sức khỏe răng miệng, điều trị nha khoa tổng quát, chỉnh nha, phục hình và tư vấn Implant.',

    doctorCount: 1,

    status: 'active',

    featured: true,
    showMenu: true,

    order: 5,

    metaTitle:
      'Chuyên khoa Răng Hàm Mặt | MediCare',

    metaDescription:
      'Tìm bác sĩ Răng Hàm Mặt và đặt lịch khám nha khoa trực tuyến tại MediCare.',

    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },


  /* ============================================================
     06. MẮT
     ============================================================ */
  {
    id: 6,

    name: 'Mắt',
    slug: 'mat',

    icon: 'eye',

    description:
      'Thăm khám và điều trị các bệnh lý về mắt, tật khúc xạ, đục thủy tinh thể và các vấn đề liên quan đến thị lực.',

    doctorCount: 1,

    status: 'active',

    featured: true,
    showMenu: true,

    order: 6,

    metaTitle:
      'Chuyên khoa Mắt | MediCare',

    metaDescription:
      'Tìm bác sĩ chuyên khoa Mắt và đặt lịch khám trực tuyến tại MediCare.',

    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },


  /* ============================================================
     07. SẢN PHỤ KHOA
     ============================================================ */
  {
    id: 7,

    name: 'Sản phụ khoa',
    slug: 'san-phu-khoa',

    icon: 'maternity',

    description:
      'Thăm khám sức khỏe phụ nữ, chăm sóc thai kỳ, tư vấn sức khỏe sinh sản và điều trị các bệnh lý phụ khoa.',

    doctorCount: 0,

    status: 'active',

    featured: false,
    showMenu: true,

    order: 7,

    metaTitle:
      'Chuyên khoa Sản phụ khoa | MediCare',

    metaDescription:
      'Tìm bác sĩ Sản phụ khoa và đặt lịch khám trực tuyến tại MediCare.',

    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },


  /* ============================================================
     08. THẦN KINH
     ============================================================ */
  {
    id: 8,

    name: 'Thần kinh',
    slug: 'than-kinh',

    icon: 'neurology',

    description:
      'Thăm khám và điều trị các bệnh lý thần kinh, đau đầu, chóng mặt, rối loạn giấc ngủ và các vấn đề liên quan đến hệ thần kinh.',

    doctorCount: 0,

    status: 'active',

    featured: false,
    showMenu: true,

    order: 8,

    metaTitle:
      'Chuyên khoa Thần kinh | MediCare',

    metaDescription:
      'Tìm bác sĩ Thần kinh và đặt lịch khám trực tuyến tại MediCare.',

    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
];


/* ============================================================
   FREEZE DATA GỐC
   Tránh code khác vô tình thay đổi dữ liệu seed.
   ============================================================ */

SPECIALTIES_DATA.forEach(
  (specialty) => {
    Object.freeze(specialty);
  }
);

Object.freeze(
  SPECIALTIES_DATA
);


/* ============================================================
   EXPORT GLOBAL
   ============================================================ */

if (
  typeof window !== 'undefined'
) {
  window.SPECIALTIES_DATA =
    SPECIALTIES_DATA;
}