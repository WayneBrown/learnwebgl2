# PLY polygon file routines

#COPTIONS = -g -cckr -DDEBUG_CLIP
COPTIONS = -g -cckr
#COPTIONS = -O -cckr
CFLAGS = -I. $(COPTIONS) -float -DIRIS
LIBS = -lmalloc -lc_s -lfm_s -lgl_s -lm

default: plyfile.o
	ar -r libply.a plyfile.o

plytest.o: plytest.c ply.h
	cc -g -c plytest.c -I.

plyfile.o: plyfile.c ply.h
	cc -g -c plyfile.c -I.

PLY_OBJS = plytest.o plyfile.o
plytest: $(PLY_OBJS)
	cc -o plytest $(PLY_OBJS) -lm

