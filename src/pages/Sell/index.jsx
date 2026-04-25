import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/utils/formatPrice'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'
import InspectionModal from '@/components/inspection/InspectionModal'
import { postService } from '@/services/post'
import { categoryService } from '@/services/category'
import { inspectionService } from '@/services/inspection'
import api from '@/services/api'

const STEPS = [
  { id: 1, label: 'Thông tin cơ bản' },
  { id: 2, label: 'Thông số kỹ thuật' },
  { id: 3, label: 'Giá & Vị trí' },
  { id: 4, label: 'Hình ảnh' },
]

const YEARS = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i)

const BRANDS = [
  'GIANT', 'TREK', 'SPECIALIZED', 'CANNONDALE', 'SCOTT', 'MERIDA', 'BIANCHI', 'PINARELLO', 
  'CERVELO', 'COLNAGO', 'BMC', 'ORBEA', 'CUBE', 'FOCUS', 'CANYON', 'SANTA_CRUZ', 
  'THONG_NHAT', 'ASAMA', 'FORNIX', 'OTHER'
]

const CONDITIONS = [
  { value: 'NEW', label: 'Mới 100%' },
  { value: 'LIKE_NEW', label: 'Như mới (>90%)' },
  { value: 'GOOD', label: 'Tốt (70-90%)' },
  { value: 'USED', label: 'Đã dùng (50-70%)' },
  { value: 'NEED_REPAIR', label: 'Cần sửa (<50%)' },
]

const FRAME_MATERIALS = ['CARBON', 'ALUMINUM', 'STEEL', 'TITANIUM', 'ALLOY', 'CHROMOLY']
const FRAME_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'SIZE_47', 'SIZE_49', 'SIZE_51', 'SIZE_53', 'SIZE_55', 'SIZE_57', 'SIZE_59', 'SIZE_61']
const BRAKE_TYPES = ['DISC_HYDRAULIC', 'DISC_MECHANICAL', 'RIM_BRAKE', 'V_BRAKE', 'CANTILEVER']
const GROUPSETS = [
  'SHIMANO_DURA_ACE', 'SHIMANO_ULTEGRA', 'SHIMANO_105', 'SHIMANO_TIAGRA', 'SHIMANO_SORA', 
  'SHIMANO_CLARIS', 'SHIMANO_XTR', 'SHIMANO_XT', 'SHIMANO_SLX', 'SHIMANO_DEORE', 
  'SRAM_RED', 'SRAM_FORCE', 'SRAM_RIVAL', 'SRAM_APEX', 'CAMPAGNOLO_SUPER_RECORD', 
  'CAMPAGNOLO_RECORD', 'CAMPAGNOLO_CHORUS', 'OTHER'
]

const DISTRICTS = [
  'QUAN_1', 'QUAN_2', 'QUAN_3', 'QUAN_4', 'QUAN_5', 'QUAN_6', 'QUAN_7', 'QUAN_8', 
  'QUAN_9', 'QUAN_10', 'QUAN_11', 'QUAN_12', 'QUAN_BINH_THANH', 'QUAN_GO_VAP', 
  'QUAN_PHU_NHUAN', 'QUAN_TAN_BINH', 'QUAN_TAN_PHU', 'QUAN_THU_DUC', 'HUYEN_BINH_CHANH', 
  'HUYEN_CAN_GIO', 'HUYEN_CU_CHI', 'HUYEN_HOC_MON', 'HUYEN_NHA_BE'
]

const inputClass = 'w-full px-3 py-2.5 border border-border-light rounded-sm focus:outline-none focus:border-navy text-sm transition-colors'
const inputErrorClass = 'w-full px-3 py-2.5 border border-error rounded-sm focus:outline-none focus:border-error text-sm transition-colors'
const labelClass = 'block text-sm font-medium text-content-primary mb-1.5'
const hintClass = 'text-xs text-content-secondary mt-1'

// Placeholder - file sẽ được tạo lại
export default function SellPage() {
  return <div>Placeholder</div>
}
