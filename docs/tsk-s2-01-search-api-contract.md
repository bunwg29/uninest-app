# TSK-S2-01 - Backend Contract Required By FE

## Endpoint

`GET /api/listings/search`

Chỉ trả về tin có `status = active`. Backend là nguồn dữ liệu quyết định trạng thái và thứ tự kết quả.

## Query

| Tham số     | Kiểu      | Ghi chú                                                                  |
| ----------- | --------- | ------------------------------------------------------------------------ |
| `keyword`   | `string?` | Tìm theo tiêu đề và địa chỉ                                              |
| `minPrice`  | `number?` | Đồng/tháng, lớn hơn hoặc bằng 0                                          |
| `maxPrice`  | `number?` | Đồng/tháng, phải lớn hơn hoặc bằng `minPrice`                            |
| `minArea`   | `number?` | m², lớn hơn 0                                                            |
| `maxArea`   | `number?` | m², phải lớn hơn hoặc bằng `minArea`                                     |
| `roomTypes` | `string?` | Danh sách mã loại phòng, phân tách bằng dấu phẩy                         |
| `amenities` | `string?` | Danh sách ID tiện ích, phân tách bằng dấu phẩy; điều kiện AND            |
| `latitude`  | `number?` | WGS 84; đi cùng `longitude`                                              |
| `longitude` | `number?` | WGS 84; đi cùng `latitude`                                               |
| `radius`    | `number?` | Bán kính km; mặc định 5                                                  |
| `sortBy`    | `string`  | `newest`, `price_asc`, `price_desc`, `area_asc`, `area_desc`, `distance` |
| `page`      | `number`  | Bắt đầu từ 1                                                             |
| `limit`     | `number`  | Mặc định 10                                                              |

`sortBy=distance` yêu cầu đủ `latitude` và `longitude`.

## Response

```json
{
  "status": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "Phòng trọ gần Bách khoa",
        "thumbnail": "https://...",
        "imageUrls": ["https://..."],
        "price": 2500000,
        "area": 22,
        "address": "Nguyễn Lương Bằng, Đà Nẵng",
        "roomType": "phong_tro",
        "amenityIds": [4, 6, 7],
        "location": { "latitude": 16.073, "longitude": 108.149 },
        "distanceMeters": 1240,
        "isHighlighted": false,
        "isReserved": false,
        "rating": 4.7,
        "reviewCount": 32,
        "capacity": 2,
        "status": "active",
        "stats": { "views": 1842, "saved": 62 },
        "createdAt": "2026-09-28T00:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 126, "totalPages": 13 }
  },
  "error": null,
  "messages": "Tìm kiếm phòng thành công"
}
```

Map chỉ hiển thị marker của các item thuộc những trang frontend đã tải. Tìm theo viewport có thể dùng cùng `latitude`, `longitude`, `radius`; không yêu cầu frontend tải toàn bộ dữ liệu.
