/* Allocates N megabytes and touches every page, so they really count. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char **argv)
{
	long mb = argc > 1 ? atol(argv[1]) : 100;
	char *p = malloc((size_t)mb << 20);

	if (!p)
		return 1;
	memset(p, 1, (size_t)mb << 20);
	printf("touched %ld MB\n", mb);
	return 0;
}
