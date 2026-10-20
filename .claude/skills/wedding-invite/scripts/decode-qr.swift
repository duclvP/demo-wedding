// Đọc nội dung mã QR trong ảnh bằng macOS Vision (không cần cài thêm gì).
// Dùng: swift decode-qr.swift <ảnh.png|jpg>
// Ảnh chụp màn hình nên crop sát mã QR trước (sips -c H W --cropOffset Y X) cho chắc.
import AppKit
import Vision

let url = URL(fileURLWithPath: CommandLine.arguments[1])
guard let img = NSImage(contentsOf: url) else { fatalError("Không mở được ảnh") }
var rect = CGRect(origin: .zero, size: img.size)
let cg = img.cgImage(forProposedRect: &rect, context: nil, hints: nil)!
let req = VNDetectBarcodesRequest()
try VNImageRequestHandler(cgImage: cg).perform([req])
for r in req.results ?? [] { print(r.payloadStringValue ?? "nil") }
