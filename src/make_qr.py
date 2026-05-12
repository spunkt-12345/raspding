import qrcode
img = qrcode.make('Jo leckst mi am orsch!')
# type(img)  # qrcode.image.pil.PilImage
img.save("some_file.png")