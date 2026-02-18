const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

import Cookies from "js-cookie";
import { getOrCreate30mSession } from "./session30m";


// hiện tại: 
// bấm vào product, 
// add product to cart, 
// add favorite, 
// bấm vào tin tức, 
// tạo đơn hàng, 
// lưu mã giảm giá,
// tìm kiếm
// xem tin tức

const track = async (event_type: string, metadata: any = {}) => {
  const token = Cookies.get('accessToken');
  const session = getOrCreate30mSession();

  const payload = {
    event_type,
    metadata: session ? { ...metadata, sessionId: session.sessionId } : metadata
  }
  console.log("send tracking data: ", payload);
  try {
    await fetch(`${API_URL}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Silent fail → không làm UX bị giật
    console.warn('[track] failed', event, err);
  }
};

export default track;