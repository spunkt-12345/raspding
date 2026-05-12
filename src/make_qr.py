import qrcode

text = input("Bitte SerNo eingeben: ")

img = qrcode.make(text)
# # type(img)  # qrcode.image.pil.PilImage

# qr = qrcode.QRCode(
#     version=1,
#     error_correction=qrcode.constants.ERROR_CORRECT_L,
#     box_size=10,
#     border=4,
# )
# qr.add_data("Jo leckst mi am orsch!")
# qr.make(fit=True)

# img = qr.make_image(fill_color="black", back_color="white")

img.save("some_file.png")