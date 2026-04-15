import { StatCard } from '@/components/admin/StatCard'

export default function AdminStatistics() {
  const stats = [
    { title: 'Tổng người dùng', value: '2,456', change: 12, icon: '👥' },
    { title: 'Người bán hoạt động', value: '1,230', change: 8, icon: '🏪' },
    { title: 'Tổng tin đăng', value: '5,840', change: 18, icon: '📝' },
    { title: 'Tổng giao dịch (tháng)', value: '₫2.5B', change: 24, icon: '💳' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-content-primary">Thống kê & Báo cáo</h1>
        <p className="text-content-secondary mt-2">Xem toàn cảnh hiệu suất hệ thống</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth */}
        <div className="bg-surface rounded-sm border border-border-light p-6 shadow-card">
          <h2 className="text-lg font-bold text-content-primary mb-4">Tăng trưởng người dùng</h2>
          <div className="h-64 flex items-end justify-around gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-navy rounded-t-lg" style={{ height: `${Math.random() * 100 + 40}%` }}></div>
                <span className="text-xs text-content-secondary">{`T${i + 1}`}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction Trend */}
        <div className="bg-surface rounded-sm border border-border-light p-6 shadow-card">
          <h2 className="text-lg font-bold text-content-primary mb-4">Xu hướng giao dịch</h2>
          <div className="h-64 flex items-end justify-around gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-success rounded-t-lg" style={{ height: `${Math.random() * 100 + 30}%` }}></div>
                <span className="text-xs text-content-secondary">{`T${i + 1}`}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-surface rounded-sm border border-border-light p-6 shadow-card">
          <h2 className="text-lg font-bold text-content-primary mb-4">Phân bố theo danh mục</h2>
          <div className="space-y-4">
            {[
              { name: 'Xe máy', percentage: 60, count: 3500 },
              { name: 'Xe đạp', percentage: 25, count: 1450 },
              { name: 'Phụ kiện xe', percentage: 10, count: 580 },
              { name: 'Khác', percentage: 5, count: 290 },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-medium text-content-primary">{item.name}</p>
                  <p className="text-sm text-content-secondary">{item.count} tin</p>
                </div>
                <div className="w-full h-2 bg-surface-tertiary rounded-full overflow-hidden">
                  <div className="h-full bg-navy" style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Type Distribution */}
        <div className="bg-surface rounded-sm border border-border-light p-6 shadow-card">
          <h2 className="text-lg font-bold text-content-primary mb-4">Phân bố loại người dùng</h2>
          <div className="flex justify-center items-center h-48">
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 rounded-full border-8 border-navy/30 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-content-primary">55%</p>
                  <p className="text-sm text-content-secondary">Người mua</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6 text-center">
            <div className="p-3 rounded-sm bg-surface-tertiary">
              <p className="text-sm font-medium text-content-primary">Người mua</p>
              <p className="text-xl font-bold text-content-primary mt-1">1,350</p>
            </div>
            <div className="p-3 rounded-sm bg-surface-tertiary">
              <p className="text-sm font-medium text-content-primary">Người bán</p>
              <p className="text-xl font-bold text-success mt-1">1,106</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface rounded-sm border border-border-light p-6 shadow-card">
          <p className="text-sm text-content-secondary font-medium">Tỷ lệ chuyển đổi</p>
          <p className="text-3xl font-bold text-content-primary mt-2">3.2%</p>
          <p className="text-xs text-content-secondary mt-2">So với tháng trước: +0.5%</p>
        </div>
        <div className="bg-surface rounded-sm border border-border-light p-6 shadow-card">
          <p className="text-sm text-content-secondary font-medium">Thời gian bán trung bình</p>
          <p className="text-3xl font-bold text-success mt-2">4.2 ngày</p>
          <p className="text-xs text-content-secondary mt-2">Nhanh hơn so với ngành</p>
        </div>
        <div className="bg-surface rounded-sm border border-border-light p-6 shadow-card">
          <p className="text-sm text-content-secondary font-medium">Mức độ hài lòng</p>
          <p className="text-3xl font-bold text-warning mt-2">4.6/5</p>
          <p className="text-xs text-content-secondary mt-2">Dựa trên 542 đánh giá</p>
        </div>
        <div className="bg-surface rounded-sm border border-border-light p-6 shadow-card">
          <p className="text-sm text-content-secondary font-medium">Tỷ lệ giao dịch thành công</p>
          <p className="text-3xl font-bold text-success mt-2">98.5%</p>
          <p className="text-xs text-content-secondary mt-2">Lực lượng 1,850 giao dịch</p>
        </div>
      </div>

      {/* Recent Performance */}
      <div className="bg-surface rounded-sm border border-border-light p-6 shadow-card">
        <h2 className="text-lg font-bold text-content-primary mb-6">Hiệu suất 30 ngày gần đây</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left py-3 px-4 font-semibold text-content-primary">Chỉ số</th>
                <th className="text-right py-3 px-4 font-semibold text-content-primary">Giá trị</th>
                <th className="text-right py-3 px-4 font-semibold text-content-primary">Thay đổi</th>
              </tr>
            </thead>
            <tbody>
              {[
                { metric: 'Lượt xem trung bình/ngày', value: '12,450', change: '+15%' },
                { metric: 'Giao dịch/ngày', value: '62', change: '+8%' },
                { metric: 'Doanh thu/ngày', value: '₫82.5M', change: '+22%' },
                { metric: 'Người dùng mới', value: '145', change: '+5%' },
                { metric: 'Tỷ lệ giữ chân', value: '87%', change: '+3%' },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-border-light last:border-0 hover:bg-surface-tertiary transition-colors">
                  <td className="py-3 px-4 text-content-primary">{row.metric}</td>
                  <td className="py-3 px-4 text-right font-medium text-content-primary">{row.value}</td>
                  <td className="py-3 px-4 text-right text-success font-medium">{row.change}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}





