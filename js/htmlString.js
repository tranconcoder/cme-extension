class HtmlString {
	settingsBox = {
		tabList: {
			feature: `
            <li class="tab-list__item features">
               <div class="features__auto-turn-off-media">
                  <div class="auto-turn-off-media__content">
                     <h2 class="content__label">Tự động tắt mic và camera</h2>
                     <span class="content__desc"> Tắt mic và camera trong lúc đầu tham gia phòng học. </span>
                  </div>
                  <label class="toggle-btn">
                     <input type="checkbox" />
                     <div class="slider"></div>
                  </label>
               </div>
               <div class="features__auto-accept">
                  <div class="auto-accept__content">
                     <h2 class="content__label">Tự động duyệt thành viên</h2>
                     <span class="content__desc"> Tự động duyệt những yêu cầu tham gia vào phòng học. </span>
                  </div>
                  <label class="toggle-btn">
                     <input type="checkbox" />
                     <div class="slider"></div>
                  </label>
               </div>
               <div class="features__authenticate">
                  <div class="authenticate__content">
                     <h2 class="content__label">Chặn yêu cầu bất hợp pháp</h2>
                     <span class="content__desc"> Chặn những yêu cầu của cá nhân không nằm trong danh sách lớp. </span>
                  </div>
                  <label class="toggle-btn">
                     <input type="checkbox" />
                     <div class="slider"></div>
                  </label>
               </div>
               <div class="features__auto-attendance">
                  <div class="auto-attendance__content">
                     <h2 class="content__label">Tự động điểm danh và lưu tin nhắn</h2>
                     <span class="content__desc"> Điểm danh chi tiết các thành viên trong danh sách lớp học và lưu lại các tin nhắn trong lúc học.</span>
                  </div>
                  <label class="toggle-btn">
                     <input type="checkbox" />
                     <div class="slider"></div>
                  </label>
               </div>
            </li>	 
         `,
			group: `
			<li id="group-tab" class="tab-list__item group">
				<div class="group__create-meeting-btn">
					<i class="fal fa-video-plus"></i>
					<p>Phòng nhóm mới</p>
				</div>

				<div class="group__table-wrapper">
					<div class="table-wrapper__caption">
						<img src="${getLink("img/workingGroup.svg")}" alt="" />
						<div class="caption__content-box">
							<h2>Chia nhóm thảo luận</h2>
							<p>Giải pháp thảo luận nhóm hiệu quả dành cho Google Meet.</p>
						</div>
					</div>

					<table class="table-wrapper__table">
						<thead class="table__head">
							<tr class="head__row">
								<th class="row__group-name">Tên nhóm</th>
								<th class="row__group-class">Thuộc lớp</th>
								<th class="row__group-start">Bắt đầu</th>
								<th class="row__group-end">Kết thúc</th>
								<th class="row__group-members">Thành viên</th>
								<th class="row__group-meet-link">Meet Link</th>
								<th class="row__group-edit"></th>
							</tr>
						</thead>

						<tbody js-elm="group-table-body" id="group-tab__group-list" class="table__body"></tbody>
						<tfoot class="table__foot">
							<tr>
								<td colspan="7">Hết danh sách</td>
							</tr>
						</tfoot>
					</table>
				</div>

				<div class="group__table-timeout-wrapper">
					<div class="table-timeout-wrapper__caption">
						<div class="caption__content-box">
							<h2>Danh sách nhóm đã quá hạn</h2>
							<p>Sau 3 ngày quá hạn, hệ thống sẽ tự xóa nếu người dùng không gia hạn.</p>
						</div>
						<img src="${getLink("img/timeout.svg")}" alt="" />
					</div>

					<table class="table-wrapper__table">
						<thead class="table__head">
							<tr class="head__row">
								<th class="row__group-name">Tên nhóm</th>
								<th class="row__group-class">Thuộc lớp</th>
								<th class="row__group-timeout">Quá hạn</th>
								<th class="row__group-members">Thành viên</th>
								<th class="row__group-edit"></th>
							</tr>
						</thead>

						<tbody js-elm="group-table-body" id="group-tab__group-timeout-list" class="table__body"></tbody>
						
						<tfoot class="table__foot">
							<tr>
								<td colspan="5">Hết danh sách</td>
							</tr>
						</tfoot>
					</table>
				</div>
			</li>
		`,
			statistical: `
            <li class="tab-list__item statistical">
					<div class="statistical__state-message"><img src="${getLink(
						"img/toggleIcon.png"
					)}" alt=""/> <span>Bật điểm danh để bắt đầu thống kê!</span></div>
					<div class="statistical__slide-1">
						<div class="slide-1__class-info-name">
							<h2 class="class-info-name__class-name">...</h2>
							<span class="class-info-name__label">Lớp hiện tại</span>
						</div>
						<div class="slide-1__time-learning">
							<h2 class="time-learning__time">00:00:00</h2>
							<span class="time-learning__label">Thời gian</span>
						</div>
						<div class="slide-1__student-exist-count">
							<h2 class="student-exist-count__count">... HS</h2>
							<span class="student-exist-count__label">Học sinh có mặt</span>
						</div>
					</div>

					<div class="statistical__slide-2">
						<div class="slide-2__not-exist-student">
							<h2 class="not-exist-student__caption">HS hiện chưa có mặt</h2>
							<div class="not-exist-student__box"></div>
						</div>
					</div>

					<div class="statistical__slide-3">
						<h2 class="slide-3__caption">Thống kê chi tiết</h2>

						<div class="slide-3__note">
							<div class="note__head"><p>Chú thích</p></div>
							<div class="note__body">
								<span class="body__not-exist">
									<div class="circle circle--offline"></div>
									<p>Hiện không có mặt</p>
								</span>

								<span class="body__exist">
									<div class="circle circle--online"></div>
									<p>Hiện đang có mặt</p>
								</span>
								
								<span class="body__working-group">
									<div class="circle circle--working-group"></div>
									<p>Đang trong phòng họp nhóm</p>
								</span>
							</div>
						</div>

						<div class="slide-3__header">
							<div class="header__index">
									<span class="index__title">STT</span>
									<label class="index__sort" data-sort-type="0">
										<input type="radio" name="sort-column" value="index" checked />
										<i class="fas fa-sort-alpha-down"></i>
										<i class="fas fa-sort-alpha-down-alt"></i>	
									</label>
							</div>
							<div class="header__name"><span class="name__title">Họ và tên</span></div>
							<div class="header__exist-bar"><span class="exist-bar__title">Phần trăm có mặt</span></div>
							<div class="header__join-and-exit-timers"><span>Vào lần đầu</span></div>
							<div class="header__time-learning">
									<span class="time-learning__title">Thời gian</span>
									<label class="time-learning__sort" data-sort-type="0">
										<input type="radio" name="sort-column" value="timeLearning" />
										<i class="fas fa-sort-alpha-down"></i>
										<i class="fas fa-sort-alpha-down-alt"></i>
									</label>
							</div>
							<div class="header__not-exist-status">
								<span>Điểm danh</span>
							</div>
						</div>
						<ul class="slide-3__student-wrapper"></ul>
						<div class="slide-3__footer">
							<p>----- Hết danh sách -----</p>
						</div>
					</div>

					<div class="statistical__slide-4">
						<div class="slide-4__interactive-ctn">
							<header class="interactive-ctn__head">
								<p>Thống kê tương tác</p>
							</header>
			
							<div class="interactive-ctn__body">
								<ul class="body__interactive-list"></ul>
							</div>
						</div>
					</div>
				</li>
         `,
			allClassInfo: `
				<li class="tab-list__item all-class-info">
					<div class="input-methods">
						<div class="input-methods__manual"><i class="fad fa-keyboard"></i><span class="manual__title"> Nhập thủ công </span></div>
						<div class="input-methods__automatic"><i class="fad fa-cogs"></i></i><span class="automatic__title"> Nhập tự động </span></div>
						<div class="input-methods__from-excel"><i class="fad fa-table"></i><span class="from-excel__title"> Nhập bằng Excel </span></div>
						<div id="toggle-online-form-box-btn" class="input-methods__online-form"><i class="fad fa-link"></i><span class="online-form__title"> Nhập bằng Link </span></div>
					</div>

					<div js-elm="class-info-is-updating-by-online-form" class="class-info-is-updating-by-online-form show">
						<p>Lớp học này đang nhận cập nhật dữ liệu từ Biểu mẫu online, bạn có thể tắt nó tại <label for="import-with-online-form-state">đây</label>!</p>
					</div>

					<div class="add-student">
						<div class="add-student__img"><img src="${getLink("img/addContactIcon.png")}" alt="" /></div>
						<div class="add-student__input-range">
							<div class="input-range__input">
								<form>
									<div class="input__message-box">
									<img src="${getLink("img/warningIcon.png")}" alt="" />
									<p>Vui lòng nhập số thứ tự!</p>
									</div>
									<div class="input__index-ctn"><input type="number" min="0" max="999" class="index-ctn__input" placeholder=" " id="table-input-index" maxlength="4" /> <label for="table-input-index">STT</label></div>
									<div class="input__name-ctn"><input type="text" class="name-ctn__input" placeholder=" " id="table-input-name" /> <label for="table-input-name">Họ và tên</label></div>
									<div class="input__meet-name-ctn"><input type="text" class="meet-name-ctn__input" placeholder=" " id="table-input-meet-name" /> <label for="table-input-meet-name">Tên meet</label></div>
									<div class="input__gmail-ctn"><input type="text" class="gmail-ctn__input" placeholder=" " id="table-input-gmail" /> <label for="table-input-gmail">Địa chỉ Gmail</label></div>
									<div class="input__submit">
									<button class="submit__submit-btn" type="button"><p>Thêm</p></button>
									</div>
								</form>
							</div>
						</div>
					</div>

					<input type="checkbox" id="import-from-excel-state">
					<div class="import-from-excel">
						<h3>Hướng dẫn các bước nhập dữ liệu bằng Excel</h3>
						<div class="import-from-excel__step-1">
							<div class="step-1__number">1</div>
							<div class="step-1__content">
							<p>
								Tải file excel mẫu bằng tại <b><u><button>ĐÂY</button></u></b> và điền thông tin học sinh (có thể cho bí thư hoặc lớp trưởng làm).
							</p>
							</div>
						</div>

						<div class="import-from-excel__step-2">
							<div class="step-2__number">2</div>
								<div class="step-2__content">
								<p>
									Sau khi điền xong file excel hãy nhấn vào nút này để nhập: <input type="file" id="student-list-excel-file-input" accept="msexcel/*" />
								</p>
							</div>
						</div>

						<div class="import-from-excel__step-3">
							<div class="step-3__number">3</div>
							<div class="step-3__content">
								<p>
									Nhập xong file excel hãy nhấn nút này để hoàn tất <button id="student-list-excel-file-submit-btn" disabled>Cập nhật bằng file này</button>
								</p>
							</div>
						</div>
					</div>

					<input type="checkbox" id="import-with-online-form-state">
					<div js-elm="online-form-wrapper" id="add-student-with-form" class="import-with-online-form">
						<h3 class="title">Nhập thông tin bằng biểu mẫu online</h3>

						<div class="class-to-add-information">
							<span>Chọn lớp nhận thông tin</span>

							<div class="drop-list">
								<div class="current">
									<p></p>
								</div>

								<ul class="list"></ul>
							</div>
						</div>

						<div class="password-to-edit">
							<span>
								<p>Mật khẩu dùng để chỉnh sửa</p>
								<p>Gửi password này đến người cần điền biểu mẫu, không gây mất bảo mật.</p>
							</span>

							<div class="password-handle-container">
								<input js-elm="online-form-password-input" type="password" spellcheck="false" placeholder="Mật khẩu..." />

								<i class="fas fa-eye show-password-btn" js-elm="show-password-form-url-btn"></i>
								<i class="fas fa-eye-slash hide-password-btn" js-elm="hide-password-form-url-btn"></i>

								<i class="fad fa-clone" js-elm="copy-form-password-btn"></i>

								<i class="refresh-password-btn fas fa-redo-alt"></i>
							</div>
						</div>

						<div class="accept-new-request">
							<span>
								<p>Chấp nhận thông tin mới từ biểu mẫu</p>
								<p>khi bật thông tin mới được nhập từ biểu mẫu sẽ được cập nhật vào danh sách.</p>
							</span>

							<label class="accept-new-request-btn">
								<input type="checkbox" js-elm="form-accept-new-request-input"/>

								<div class="slider"></div>
							</label>
						</div>

						<div class="online-form-url-wrapper">
							<a class="online-form-url" href="https://www.google.com/" target="_blank" rel="noopener noreferrer">
								<p>https://www.google.com/</p>
							</a>

							<i class="copy-btn far fa-clone" js-elm="copy-form-url-btn"></i>
							<i class="reset-url-btn far fa-redo-alt"></i>
						</div>

						<div class="tutorial">
							<h3 class="title">Hướng dẫn</h3>

							<div class="step-container">
								<div class="step-1">
									<span class="icon">1</span>
									<span class="content">Chọn lớp để nhận thông tin từ biểu mẫu.</span>
								</div>

								<div class="step-2">
									<span class="icon">2</span>
									<span class="content">Đặt mật khẩu cho biểu mẫu (nếu muốn).</span>
								</div>

								<div class="step-3">
									<span class="icon">3</span>
									<span class="content">Bật "Chấp nhận thông tin mới từ biểu mẫu".</span>
								</div>

								<div class="step-4">
									<span class="icon">4</span>
									<span class="content">Sao chép và gửi link cho học sinh nhập kèm mật khẩu ở bước 3 (nếu có).</span>
								</div>

								<div class="step-5">
									<span class="icon">5</span>
									<span class="content">Tắt "Chấp nhận thông tin mới từ biểu mẫu" khi học sinh nhập xong.</span>
								</div>
							</div>
						</div>
					</div>					

					<div class="table">
					<table class="table__student-table" cellspacing="0" cellpadding="0">
						<thead class="student-table__header">
						<tr class="header__caption">
							<td class="caption__content" colspan="6">Danh sách học sinh</td>
						</tr>
						<tr class="header__tools-bar">
							<td class="tools-bar__wrapper" colspan="6">
								<div class="wrapper__bar">
									<div class="bar__left-slide">
									<span class="left-slide__select-all"> <p>Chọn tất cả</p> </span> <span class="left-slide__unselect-all"> <p>Bỏ chọn</p> </span> <span class="left-slide__selected-count">đã chọn 0</span>
									</div>
									<div class="bar__right-slide">
									<div><div class="right-slide__undo"><img src="${getLink("img/undoIcon.png")}" alt="" /></div></div>
									<div><div class="right-slide__redo"><img src="${getLink("img/redoIcon.png")}" alt="" /></div></div>
									<div><div class="right-slide__delete"><img src="${getLink(
										"img/deleteIcon.png"
									)}" alt="" /></div></div>
									</div>
								</div>
							</td>
						</tr>
						<tr class="header__class-list">
							<td class="class-list__wrapper" colspan="6">
								<div class="wrapper__bar">
									<div class="bar__left-slide"><ul js-elm="class-button-container" class="left-slide__class-button-container"></ul></div>
									<div class="bar__right-slide">
									<button class="right-slide__add-class-btn">
										<img src="${getLink("img/addIcon.png")}" alt="" />
										<p>Thêm lớp</p>
									</button>
									</div>
								</div>
							</td>
						</tr>
						<tr class="header__row">
							<th class="row__index">STT</th>
							<th class="row__name">Họ và tên</th>
							<th class="row__meet-name">Tên Google meet</th>
							<th class="row__gmail">Địa chỉ Gmail</th>
							<th class="row__exist-state">Trạng thái</th>
							<th class="row__select">✔</th>
						</tr>
						</thead>
						<tbody class="student-table__body"></tbody>
						<tfoot class="student-table__foot">
							<tr>
								<td colspan="6"></td>
							</tr>
						</tfoot>
					</table>
					</div>
				</li>
			`,
			history: `
				<li class="tab-list__item attendance-history">
					<ul js-elm="attendance-history-wrapper" class="attendance-history__wrapper"></ul>
				</li>
         `,
			authenticate: `
            <li class="tab-list__item authenticate" id="settings-box__authenticate-tab">
					<div class="authenticate__ctn">
						<button class="ctn__logout-btn">
							<i class="far fa-sign-out-alt"></i>
							<p>Đăng xuất</p>
						</button>

						<img src="${getLink("img/avatar.png")}" alt="google-avatar" />

						<button class="ctn__sign-in-btn">
							<img src="${getLink("img/google.png")}" alt="google-icon" />
							<p>Đăng nhập bằng Google</p>
						</button>

						<p class="ctn__login-alert">
							Bước đăng nhập là bắt buộc để có thể sử dụng các tính năng!
						</p>

						<div class="ctn__info">
							<div class="info__name">
								<span class="name__label">Tài khoản:</span>
								<span class="name__content">Nguyễn Trung Trờ</span>
							</div>

							<div class="info__gmail">
								<span class="gmail__label">Gmail:</span>
								<span class="gmail__content">thptnhs.12a12@gmail.com</span>
							</div>
						</div>

						<div class="ctn__loading">
							<div class="loadingio-spinner-rolling-76b0hjrp7w4">
								<div class="ldio-l3m576hjipg">
									<div></div>
								</div>
							</div>
						</div>
					</div>
				<li/>
         `,
			setting: `
            <li class="tab-list__item settings">
					<ul class="settings__list-settings">
						<li class="list-settings__percent-mark">
							<div class="percent-mark__content">
									<h2 class="content__label">Đánh dấu khi tỷ lệ có mặt dưới</h2>
									<p class="content__desc">Nếu thành viên nào có mặt dưới phần trăm quy định sẽ được đánh dấu lại và tô đậm</p>
							</div>
							<div class="percent-mark__input">
									<input
										type="number"
										min="1"
										max="100"
										value="${settingsObj.getSettings().timingExistPercent}"
									/>
							</div>
						</li>
					</ul>
				</li>
         `,
		},
	};
	createGroupBox = {
		box: `
			<input id="create-group-box-status" type="checkbox" />

			<input id="group-box-type" type="text" value="" />
		
			<label class="create-group-box__background" for="create-group-box-status"></label>

			<div class="create-group-box__box">
				<header class="box__header">
					<p>Tạo nhóm mới</p>
					
					<label for="create-group-box-status">
						<i class="fal fa-times"></i>
					</label>
				</header>

				<div class="box__body">
					<div class="body__group-info">
						<div class="group-info__group-name">
							<label for="group-name-input">Tên nhóm</label>
							<input id="group-name-input" type="text" placeholder="Tên nhóm cần tạo..." />
						</div>

						<div class="group-info__group-class">
							<span>Thuộc lớp</span>
							<i class="fas fa-sort-down"></i>
							<select id="group-class-select"></select>
						</div>

						<div class="group-info__group-start-time">
							<p>Bắt đầu</p>
							<input id="group-time-start-input" type="datetime-local" />
						</div>

						<div class="group-info__group-end-time">
							<p>Thời hạn</p>
							<i class="fas fa-sort-down"></i>
							<select>
								<option value="3">3 phút</option>
								<option value="5">5 phút</option>
								<option value="7">7 phút</option>
								<option value="10">10 phút</option>
								<option value="15">15 phút</option>
								<option value="30">30 phút</option>
								<option value="45">45 phút</option>
								<option value="60">1 giờ</option>
								<option value="120">2 giờ</option>
								<option value="360">6 giờ</option>
								<option value="720">12 giờ</option>
								<option value="1440">1 ngày</option>
								<option value="4320">3 ngày</option>
								<option value="10080">1 tuần</option>
								<option value="43200">1 tháng</option>
								<option value="86400">2 tháng</option>
							</select>
						</div>

						<div class="group-info__subjects">
							<p>Môn học</p>
							<i class="fas fa-sort-down"></i>
							<select id="group-subjects-select">
								<option value="Tin học">Tin học</option>
								<option value="Toán">Toán</option>
								<option value="Tiếng anh">Tiếng anh</option>
								<option value="Ngữ văn">Ngữ văn</option>
								<option value="Lịch sử">Lịch sử</option>
								<option value="Địa lí">Địa lí</option>
								<option value="Vật lí">Vật lí</option>
								<option value="Hóa học">Hóa học</option>
								<option value="Sinh học">Sinh học</option>
								<option value="Công nghệ">Công nghệ</option>
								<option value="GDCD">GDCD</option>
								<option value="Quốc phòng">Quốc phòng</option>
								<option value="Thể dục">Thể dục</option>
								<option value="Khác">Khác</option>
							</select>
						</div>
					</div>

					<div class="mission-wrapper">
						<div class="mission-container">
							<div class="head">
								<p class="mission-title">
									Giao tài liệu thảo luận
								</p>

								<button class="add-mission-btn">
									<p>Thêm tài liệu</p>

									<div class="add-mission-box">

									</div>
								</button>
							</div>

							

							<ul class="mission-empty-list">
								<img src="${getLink("img/empty.svg")}" alt="empty-list-file">
								<p>Hiện chưa có tài liệu nào được giao.</p>
							</ul>
						</div>
					</div>

					<div class="body__search-box">
						<div class="search-box__input-ctn">
							<input type="search" placeholder="Tìm kiếm theo tên" />
							<i class="far fa-search"></i>
						</div>
					</div>

					<div class="body__student-list-ctn">
						<ul
							id="create-group-member-container"
							class="student-list-ctn__list"
						></ul>
					</div>
				</div>

				<div class="box__footer">
					<p class="footer__file-info">
						<span class="file-path">/tranvancon/home/document/test.pptx</span>
						<span class="file-size">2.0Mb</span>
					</p>

					<button disabled id="create-group-btn" class="footer__create-btn">Tạo nhóm</button>
				</div>
			</div>
		`,
	};
}
var htmlStringObj = new HtmlString();
