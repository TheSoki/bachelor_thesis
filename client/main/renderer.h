#ifndef __RENDERER_H_
#define __RENDERER_H_

#include "../lib/e-Paper/EPD_IT8951.h"
#include "../lib/Config/DEV_Config.h"


// 1 bit per pixel, which is 2 grayscale
#define BitsPerPixel_1 1
// 2 bit per pixel, which is 4 grayscale 
#define BitsPerPixel_2 2
// 4 bit per pixel, which is 16 grayscale
#define BitsPerPixel_4 4
// 8 bit per pixel, which is 256 grayscale, but will automatically reduce by hardware to 4bpp, which is 16 grayscale
#define BitsPerPixel_8 8


//For all refresh fram buf except touch panel
extern UBYTE *Refresh_Frame_Buf;

UBYTE Display_BMP(UWORD WIDTH, UWORD HEIGHT, UDOUBLE Init_Target_Memory_Addr, UBYTE BitsPerPixel);

#endif
