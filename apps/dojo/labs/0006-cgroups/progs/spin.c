/* Computes flat out for 2 seconds of wall-clock time. */
#define _POSIX_C_SOURCE 200809L
#include <time.h>

static double now(void)
{
	struct timespec t;
	clock_gettime(CLOCK_MONOTONIC, &t);
	return t.tv_sec + t.tv_nsec / 1e9;
}

int main(void)
{
	volatile unsigned long n = 0;
	double start = now();

	while (now() - start < 2.0)
		n++;
	return 0;
}
