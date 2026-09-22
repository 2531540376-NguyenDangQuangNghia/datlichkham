/* ============================================================
   MEDICARE — DATA: DOCTORS
   Dữ liệu bác sĩ mẫu

   Quy ước:
   - id: Number
   - specialtyId: liên kết SPECIALTIES_DATA
   - gender: male | female | other
   - status: active | inactive
   - featured: Boolean
   - workDays:
       2 = Thứ 2
       3 = Thứ 3
       4 = Thứ 4
       5 = Thứ 5
       6 = Thứ 6
       7 = Thứ 7
   - Không sử dụng emoji trong dữ liệu
   ============================================================ */

const DOCTORS_DATA = [
  /* ============================================================
     01. NGUYỄN VĂN AN — TIM MẠCH
     ============================================================ */
  {
    id: 1,

    name: 'Nguyễn Văn An',
    slug: 'nguyen-van-an',

    gender: 'male',

    specialtyId: 1,
    specialty: 'Tim mạch',

    degree: 'PGS.TS',

    experience: 20,

    price: 300000,

    rating: 4.9,
    reviewCount: 128,
    patientCount: 2500,

    avatar: '',

    bio:
      'PGS.TS Nguyễn Văn An có hơn 20 năm kinh nghiệm trong lĩnh vực Tim mạch, tập trung thăm khám, chẩn đoán và điều trị các bệnh lý tim mạch từ thông thường đến phức tạp.',

    expertise: [
      'Khám và điều trị bệnh tim mạch',
      'Siêu âm tim và điện tâm đồ',
      'Điều trị tăng huyết áp',
      'Theo dõi và điều trị suy tim',
      'Tư vấn dự phòng bệnh tim mạch',
    ],

    qualifications: [
      'Tốt nghiệp Đại học Y Hà Nội',
      'Tiến sĩ chuyên ngành Tim mạch',
      'Học hàm Phó Giáo sư',
      'Chứng chỉ siêu âm tim',
      'Đào tạo chuyên sâu về can thiệp tim mạch',
    ],

    workDays: [2, 3, 4, 5, 6],

    workStart: '08:00',
    workEnd: '17:00',

    address:
      '123 Nguyễn Huệ, Quận 1, TP.HCM',

    hospital:
      'Bệnh viện Chợ Rẫy',

    status: 'active',
    featured: true,

    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },


  /* ============================================================
     02. TRẦN THỊ BÌNH — NHI KHOA
     ============================================================ */
  {
    id: 2,

    name: 'Trần Thị Bình',
    slug: 'tran-thi-binh',

    gender: 'female',

    specialtyId: 2,
    specialty: 'Nhi khoa',

    degree: 'TS',

    experience: 15,

    price: 250000,

    rating: 4.8,
    reviewCount: 96,
    patientCount: 1800,

    avatar: '',

    bio:
      'TS Trần Thị Bình có 15 năm kinh nghiệm trong lĩnh vực Nhi khoa, tập trung thăm khám, theo dõi sức khỏe và điều trị các bệnh lý thường gặp ở trẻ em.',

    expertise: [
      'Khám và điều trị bệnh nhi',
      'Điều trị bệnh hô hấp ở trẻ',
      'Tư vấn dinh dưỡng cho trẻ',
      'Theo dõi tăng trưởng và phát triển',
      'Tư vấn tiêm chủng và phòng bệnh',
    ],

    qualifications: [
      'Tốt nghiệp Đại học Y Dược TP.HCM',
      'Tiến sĩ chuyên ngành Nhi khoa',
      'Chứng chỉ dinh dưỡng lâm sàng nhi khoa',
    ],

    workDays: [2, 3, 4, 5, 6, 7],

    workStart: '08:00',
    workEnd: '16:30',

    address:
      '456 Lê Lợi, Quận 3, TP.HCM',

    hospital:
      'Bệnh viện Nhi Đồng 1',

    status: 'active',
    featured: true,

    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },


  /* ============================================================
     03. LÊ VĂN CƯỜNG — DA LIỄU
     ============================================================ */
  {
    id: 3,

    name: 'Lê Văn Cường',
    slug: 'le-van-cuong',

    gender: 'male',

    specialtyId: 3,
    specialty: 'Da liễu',

    degree: 'BS.CKII',

    experience: 12,

    price: 200000,

    rating: 4.7,
    reviewCount: 75,
    patientCount: 1200,

    avatar: '',

    bio:
      'BS.CKII Lê Văn Cường có hơn 12 năm kinh nghiệm trong lĩnh vực Da liễu, tập trung điều trị các bệnh lý về da và chăm sóc da theo tình trạng thực tế của từng người bệnh.',

    expertise: [
      'Khám và điều trị bệnh da liễu',
      'Điều trị mụn trứng cá',
      'Điều trị nám và rối loạn sắc tố',
      'Điều trị chàm và viêm da',
      'Điều trị vảy nến',
    ],

    qualifications: [
      'Tốt nghiệp Đại học Y Hà Nội',
      'Bác sĩ Chuyên khoa II Da liễu',
      'Đào tạo chuyên sâu về điều trị và chăm sóc da',
    ],

    workDays: [2, 3, 4, 5, 6],

    workStart: '08:30',
    workEnd: '17:30',

    address:
      '789 Võ Văn Tần, Quận 3, TP.HCM',

    hospital:
      'Bệnh viện Da liễu TP.HCM',

    status: 'active',
    featured: true,

    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },


  /* ============================================================
     04. PHẠM THỊ DUNG — TAI MŨI HỌNG
     ============================================================ */
  {
    id: 4,

    name: 'Phạm Thị Dung',
    slug: 'pham-thi-dung',

    gender: 'female',

    specialtyId: 4,
    specialty: 'Tai Mũi Họng',

    degree: 'TS',

    experience: 18,

    price: 280000,

    rating: 4.9,
    reviewCount: 112,
    patientCount: 2100,

    avatar: '',

    bio:
      'TS Phạm Thị Dung có 18 năm kinh nghiệm trong lĩnh vực Tai Mũi Họng, tập trung thăm khám, nội soi và điều trị các bệnh lý tai, mũi, họng ở người lớn và trẻ em.',

    expertise: [
      'Khám Tai Mũi Họng',
      'Nội soi Tai Mũi Họng',
      'Điều trị viêm mũi và viêm xoang',
      'Điều trị bệnh lý amidan',
      'Điều trị ù tai và nghe kém',
    ],

    qualifications: [
      'Tốt nghiệp Đại học Y Hà Nội',
      'Tiến sĩ chuyên ngành Tai Mũi Họng',
      'Chứng chỉ nội soi Tai Mũi Họng',
    ],

    workDays: [2, 3, 4, 5, 6],

    workStart: '08:00',
    workEnd: '17:00',

    address:
      '321 Hai Bà Trưng, Quận 1, TP.HCM',

    hospital:
      'Bệnh viện Tai Mũi Họng TP.HCM',

    status: 'active',
    featured: true,

    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },


  /* ============================================================
     05. HOÀNG VĂN EM — RĂNG HÀM MẶT
     ============================================================ */
  {
    id: 5,

    name: 'Hoàng Văn Em',
    slug: 'hoang-van-em',

    gender: 'male',

    specialtyId: 5,
    specialty: 'Răng Hàm Mặt',

    degree: 'BS.CKI',

    experience: 10,

    price: 180000,

    rating: 4.6,
    reviewCount: 64,
    patientCount: 900,

    avatar: '',

    bio:
      'BS.CKI Hoàng Văn Em có 10 năm kinh nghiệm trong lĩnh vực Răng Hàm Mặt, tập trung nha khoa tổng quát, phục hồi chức năng và chăm sóc sức khỏe răng miệng.',

    expertise: [
      'Khám Răng Hàm Mặt tổng quát',
      'Điều trị bệnh lý răng miệng',
      'Chỉnh nha',
      'Phục hình răng',
      'Tư vấn cấy ghép Implant',
    ],

    qualifications: [
      'Tốt nghiệp Đại học Y Dược TP.HCM',
      'Bác sĩ Chuyên khoa I Răng Hàm Mặt',
      'Đào tạo chuyên sâu về chỉnh nha',
    ],

    workDays: [2, 3, 4, 5, 6, 7],

    workStart: '09:00',
    workEnd: '18:00',

    address:
      '555 Nguyễn Trãi, Quận 5, TP.HCM',

    hospital:
      'Nha khoa MediCare',

    status: 'active',
    featured: true,

    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },


  /* ============================================================
     06. VŨ THỊ PHƯƠNG — MẮT
     ============================================================ */
  {
    id: 6,

    name: 'Vũ Thị Phương',
    slug: 'vu-thi-phuong',

    gender: 'female',

    specialtyId: 6,
    specialty: 'Mắt',

    degree: 'PGS.TS',

    experience: 22,

    price: 350000,

    rating: 5.0,
    reviewCount: 156,
    patientCount: 3200,

    avatar: '',

    bio:
      'PGS.TS Vũ Thị Phương có hơn 22 năm kinh nghiệm trong lĩnh vực Nhãn khoa, tập trung thăm khám, điều trị các bệnh lý về mắt và tư vấn các phương pháp điều trị phù hợp.',

    expertise: [
      'Khám và điều trị bệnh mắt',
      'Điều trị tật khúc xạ',
      'Tư vấn phẫu thuật khúc xạ',
      'Điều trị đục thủy tinh thể',
      'Theo dõi bệnh lý võng mạc',
    ],

    qualifications: [
      'Tốt nghiệp Đại học Y Hà Nội',
      'Tiến sĩ chuyên ngành Nhãn khoa',
      'Học hàm Phó Giáo sư',
      'Đào tạo chuyên sâu về phẫu thuật khúc xạ',
    ],

    workDays: [2, 3, 4, 5, 6],

    workStart: '08:00',
    workEnd: '17:00',

    address:
      '111 Điện Biên Phủ, Quận 3, TP.HCM',

    hospital:
      'Bệnh viện Mắt TP.HCM',

    status: 'active',
    featured: true,

    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },


  /* ============================================================
     07. ĐẶNG VĂN GIANG — TIM MẠCH
     ============================================================ */
  {
    id: 7,

    name: 'Đặng Văn Giang',
    slug: 'dang-van-giang',

    gender: 'male',

    specialtyId: 1,
    specialty: 'Tim mạch',

    degree: 'BS.CKII',

    experience: 14,

    price: 250000,

    rating: 4.7,
    reviewCount: 82,
    patientCount: 1500,

    avatar: '',

    bio:
      'BS.CKII Đặng Văn Giang có 14 năm kinh nghiệm trong lĩnh vực Tim mạch, tập trung khám, theo dõi và điều trị các bệnh lý tim mạch thường gặp.',

    expertise: [
      'Khám Tim mạch tổng quát',
      'Điều trị tăng huyết áp',
      'Theo dõi rối loạn nhịp tim',
      'Siêu âm tim',
      'Điều trị và theo dõi suy tim',
    ],

    qualifications: [
      'Tốt nghiệp Đại học Y Dược TP.HCM',
      'Bác sĩ Chuyên khoa II Tim mạch',
    ],

    workDays: [2, 3, 4, 5, 6],

    workStart: '08:00',
    workEnd: '16:30',

    address:
      '123 Nguyễn Huệ, Quận 1, TP.HCM',

    hospital:
      'Bệnh viện Chợ Rẫy',

    status: 'active',
    featured: false,

    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },


  /* ============================================================
     08. BÙI THỊ HOA — NHI KHOA
     ============================================================ */
  {
    id: 8,

    name: 'Bùi Thị Hoa',
    slug: 'bui-thi-hoa',

    gender: 'female',

    specialtyId: 2,
    specialty: 'Nhi khoa',

    degree: 'ThS',

    experience: 8,

    price: 200000,

    rating: 4.6,
    reviewCount: 48,
    patientCount: 700,

    avatar: '',

    bio:
      'ThS Bùi Thị Hoa có 8 năm kinh nghiệm trong lĩnh vực Nhi khoa, tập trung chăm sóc sức khỏe, tư vấn dinh dưỡng và điều trị các bệnh lý thường gặp ở trẻ.',

    expertise: [
      'Khám và điều trị bệnh nhi',
      'Tư vấn dinh dưỡng',
      'Theo dõi tăng trưởng',
      'Tư vấn tiêm chủng',
    ],

    qualifications: [
      'Tốt nghiệp Đại học Y Dược TP.HCM',
      'Thạc sĩ chuyên ngành Nhi khoa',
    ],

    workDays: [2, 3, 4, 5, 6],

    workStart: '08:00',
    workEnd: '16:00',

    address:
      '456 Lê Lợi, Quận 3, TP.HCM',

    hospital:
      'Bệnh viện Nhi Đồng 2',

    status: 'inactive',
    featured: false,

    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
];


/* ============================================================
   FREEZE DATA GỐC
   Ngăn code khác vô tình sửa dữ liệu seed.
   ============================================================ */

DOCTORS_DATA.forEach((doctor) => {
  Object.freeze(doctor.expertise);
  Object.freeze(doctor.qualifications);
  Object.freeze(doctor.workDays);
  Object.freeze(doctor);
});

Object.freeze(DOCTORS_DATA);


/* ============================================================
   EXPORT GLOBAL
   ============================================================ */

if (typeof window !== 'undefined') {
  window.DOCTORS_DATA =
    DOCTORS_DATA;
}