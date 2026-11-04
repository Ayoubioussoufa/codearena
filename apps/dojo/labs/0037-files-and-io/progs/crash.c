/* Prints the right sum, then crashes with SIGSEGV. */
#include <signal.h>
#include <stdio.h>

int main(void)
{
	long n, sum = 0;

	while (scanf("%ld", &n) == 1)
		sum += n;
	printf("%ld\n", sum);
	fflush(stdout);
	raise(SIGSEGV);
	return 0;
}
