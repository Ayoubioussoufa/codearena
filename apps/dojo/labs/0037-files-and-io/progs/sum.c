/* Reads integers from stdin until EOF, prints their sum. */
#include <stdio.h>

int main(void)
{
	long n, sum = 0;

	while (scanf("%ld", &n) == 1)
		sum += n;
	printf("%ld\n", sum);
	return 0;
}
