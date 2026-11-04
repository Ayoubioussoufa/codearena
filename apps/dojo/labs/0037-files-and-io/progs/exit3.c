/* Prints the right sum, then exits with code 3. */
#include <stdio.h>

int main(void)
{
	long n, sum = 0;

	while (scanf("%ld", &n) == 1)
		sum += n;
	printf("%ld\n", sum);
	return 3;
}
